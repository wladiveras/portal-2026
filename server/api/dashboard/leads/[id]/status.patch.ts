import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

type LeadStatus = Database['public']['Enums']['lead_status']

const ALL: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

/**
 * Linear pipeline new → contacted → qualified → proposal → won.
 * `lost` can be reached from any non-terminal state.
 * Reopen (won/lost → earlier stage) requires admin.
 */
const FORWARD: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: [],
  lost: []
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = (await readBody(event)) as { status?: string } | undefined
  const next = body?.status as LeadStatus | undefined
  if (!next || !ALL.includes(next)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid status' })
  }

  // Auth the user (to enforce editor/admin beyond RLS and to detect admin overrides).
  const authClient = await serverSupabaseClient<Database>(event)
  const { data: userRes } = await authClient.auth.getUser()
  const userId = userRes.user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'auth required' })

  const { data: profile } = await authClient
    .from('profiles')
    .select('role,disabled')
    .eq('id', userId)
    .maybeSingle()
  if (!profile || profile.disabled || !['admin', 'editor'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  const service = serverSupabaseServiceRole(event)
  const { data: lead, error: lErr } = await service
    .from('leads')
    .select('status')
    .eq('id', id)
    .maybeSingle()
  if (lErr) throw createError({ statusCode: 500, statusMessage: lErr.message })
  if (!lead) throw createError({ statusCode: 404, statusMessage: 'lead not found' })

  if (lead.status === next) return { status: next }

  const allowedForward = FORWARD[lead.status] ?? []
  const isForward = allowedForward.includes(next)
  const isAdminReopen = profile.role === 'admin'

  if (!isForward && !isAdminReopen) {
    throw createError({ statusCode: 409, statusMessage: 'invalid transition' })
  }

  const { error: uErr } = await service
    .from('leads')
    .update({ status: next, last_seen: new Date().toISOString() })
    .eq('id', id)
  if (uErr) throw createError({ statusCode: 500, statusMessage: uErr.message })

  await service.from('lead_events').insert({
    lead_id: id,
    type: 'status_changed',
    target: next,
    meta: { from: lead.status, to: next, actor: userId }
  })

  return { status: next }
})
