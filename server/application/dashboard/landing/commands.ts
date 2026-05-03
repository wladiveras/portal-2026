import type { Database, Json } from '~/types/database.types'
import type { H3Event } from 'h3'
import { sanitizeSlug } from '~~/server/domain/dashboard/shared'
import { serverSupabaseClient } from '#supabase/server'
import { logAudit } from '~~/server/utils/audit'

export interface UpsertLandingDraftInput {
  projectId: string
  userId: string
  draftJson: Json
  slug?: string | null
}

export async function cmdUpsertLandingDraft(event: H3Event, input: UpsertLandingDraftInput): Promise<Database['public']['Tables']['project_landing']['Row']> {
  const draftJson = input.draftJson
  if (draftJson === null || typeof draftJson !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'draft_json object required' })
  }

  const auth = await serverSupabaseClient<Database>(event)

  const { data: project, error: pErr } = await auth.from('projects').select('id, slug').eq('id', input.projectId).maybeSingle()
  if (pErr) throw createError({ statusCode: 500, statusMessage: pErr.message })
  if (!project) throw createError({ statusCode: 404, statusMessage: 'project not found' })

  const rawSlug = input.slug?.trim() || project.slug
  const slug = sanitizeSlug(rawSlug)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const slugFinal = slug.slice(0, 120)

  const { data: prev } = await auth.from('project_landing').select('project_id, status').eq('project_id', input.projectId).maybeSingle()

  let data: Database['public']['Tables']['project_landing']['Row'] | null = null
  let error: { message: string; code?: string } | null = null

  if (prev) {
    const res = await auth
      .from('project_landing')
      .update({ draft_json: draftJson, slug: slugFinal })
      .eq('project_id', input.projectId)
      .select('*')
      .single()
    data = res.data
    error = res.error
  } else {
    const res = await auth
      .from('project_landing')
      .insert({
        project_id: input.projectId,
        slug: slugFinal,
        draft_json: draftJson,
        status: 'draft'
      })
      .select('*')
      .single()
    data = res.data
    error = res.error
  }

  if (error) {
    if (error.code === '23505') throw createError({ statusCode: 409, statusMessage: 'landing slug already in use' })
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) throw createError({ statusCode: 500, statusMessage: 'failed to save landing' })

  const audit = serverSupabaseServiceRole(event)
  await logAudit(audit, {
    action: 'landing_draft_saved',
    targetType: 'project_landing',
    targetId: input.projectId,
    meta: { actor_user_id: input.userId, slug: data.slug }
  })

  return data
}

export async function cmdPublishLanding(event: H3Event, input: { projectId: string; userId: string }) {
  const auth = await serverSupabaseClient<Database>(event)

  const { data: existing, error: rErr } = await auth
    .from('project_landing')
    .select('draft_json, slug')
    .eq('project_id', input.projectId)
    .maybeSingle()
  if (rErr) throw createError({ statusCode: 500, statusMessage: rErr.message })
  if (!existing) throw createError({ statusCode: 400, statusMessage: 'save a draft before publishing' })

  const now = new Date().toISOString()
  const { data, error } = await auth
    .from('project_landing')
    .update({
      published_json: existing.draft_json,
      status: 'published',
      published_at: now
    })
    .eq('project_id', input.projectId)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'landing not found' })

  const audit = serverSupabaseServiceRole(event)
  await logAudit(audit, {
    action: 'landing_published',
    targetType: 'project_landing',
    targetId: input.projectId,
    meta: { actor_user_id: input.userId, slug: data.slug }
  })

  return data
}
