import type { Json } from '~/types/database.types'

interface TrackEventBody {
  anonId: string
  type: string
  target?: string | null
  path?: string | null
  meta?: Record<string, unknown>
  utm?: Partial<{
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_content: string
    utm_term: string
  }>
  userAgent?: string
  language?: string
  referrer?: string
}

const MAX_TYPE_LEN = 64
const MAX_TARGET_LEN = 512
const MAX_ANON_LEN = 64

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as TrackEventBody | undefined
  if (!body || typeof body.anonId !== 'string' || typeof body.type !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'anonId and type are required' })
  }
  const anonId = body.anonId.slice(0, MAX_ANON_LEN).trim()
  const type = body.type.slice(0, MAX_TYPE_LEN).trim()
  if (!anonId || !type) {
    throw createError({ statusCode: 400, statusMessage: 'anonId and type must be non-empty' })
  }

  const client = serverSupabaseServiceRole(event)

  // 1. Upsert visitor by anon_id.
  const now = new Date().toISOString()
  const visitorPatch = {
    anon_id: anonId,
    last_seen: now,
    user_agent: body.userAgent?.slice(0, 512) ?? null,
    language: body.language?.slice(0, 16) ?? null,
    referrer: body.referrer?.slice(0, 1024) ?? null,
    utm_source: body.utm?.utm_source?.slice(0, 128) ?? null,
    utm_medium: body.utm?.utm_medium?.slice(0, 128) ?? null,
    utm_campaign: body.utm?.utm_campaign?.slice(0, 128) ?? null,
    utm_content: body.utm?.utm_content?.slice(0, 128) ?? null,
    utm_term: body.utm?.utm_term?.slice(0, 128) ?? null
  }
  const { data: visitor, error: vErr } = await client
    .from('visitors')
    .upsert(visitorPatch, { onConflict: 'anon_id' })
    .select('id')
    .single()
  if (vErr) {
    throw createError({ statusCode: 500, statusMessage: `visitor upsert failed: ${vErr.message}` })
  }

  const { error: eErr } = await client.from('lead_events').insert({
    visitor_id: visitor.id,
    type,
    target: body.target?.slice(0, MAX_TARGET_LEN) ?? null,
    path: body.path?.slice(0, MAX_TARGET_LEN) ?? null,
    meta: (body.meta ?? {}) as Json
  })
  if (eErr) {
    throw createError({ statusCode: 500, statusMessage: `event insert failed: ${eErr.message}` })
  }

  setResponseStatus(event, 204)
  return null
})
