import type { Database, Json } from '~/types/database.types'
import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

type LandingRow = Database['public']['Tables']['project_landing']['Row']

export interface PublicLandingPayload {
  projectId: string
  slug: string
  payload: Database['public']['Tables']['project_landing']['Row']['published_json']
}

/**
 * Leitura pública (apenas publicado). Usa service role no servidor — filtro explícito.
 */
export async function qryPublicLandingBySlug(event: H3Event, slug: string): Promise<PublicLandingPayload> {
  const raw = slug?.trim().toLowerCase()
  if (!raw) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const svc = serverSupabaseServiceRole(event)
  const { data, error } = await svc
    .from('project_landing')
    .select('project_id, slug, published_json, status')
    .eq('slug', raw)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data?.published_json || data.status !== 'published') {
    throw createError({ statusCode: 404, statusMessage: 'landing not found' })
  }

  return {
    projectId: data.project_id,
    slug: data.slug,
    payload: data.published_json
  }
}

export interface DashboardLandingDTO {
  landing: LandingRow | null
  defaultSlug: string
}

/** Landing do projeto para a dashboard (RLS com JWT — membros vêem rascunho). */
export async function qryLandingForDashboard(event: H3Event, projectId: string): Promise<DashboardLandingDTO> {
  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'project id required' })

  const auth = await serverSupabaseClient<Database>(event)
  const [{ data: project }, { data: landing }] = await Promise.all([
    auth.from('projects').select('slug').eq('id', projectId).maybeSingle(),
    auth.from('project_landing').select('*').eq('project_id', projectId).maybeSingle()
  ])

  if (!project) throw createError({ statusCode: 404, statusMessage: 'project not found' })

  return { landing: landing ?? null, defaultSlug: project.slug }
}

/** Rascunho visível só para membros do projeto (RLS + JWT). */
export interface LandingDraftPreviewDTO {
  projectId: string
  slug: string
  payload: Json
  status: string
  preview: true
}

export async function qryLandingDraftPreviewBySlug(event: H3Event, slug: string): Promise<LandingDraftPreviewDTO> {
  const raw = slug?.trim().toLowerCase()
  if (!raw) throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const auth = await serverSupabaseClient<Database>(event)
  const { data, error } = await auth
    .from('project_landing')
    .select('project_id, slug, draft_json, status')
    .eq('slug', raw)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'landing not found' })

  return {
    projectId: data.project_id,
    slug: data.slug,
    payload: data.draft_json,
    status: data.status,
    preview: true
  }
}
