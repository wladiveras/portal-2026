interface TrackLeadBody {
  anonId: string
  source: string
  displayName?: string | null
  contactValue?: string | null
  utm?: Partial<{
    utm_source: string
    utm_medium: string
    utm_campaign: string
    utm_content: string
    utm_term: string
  }>
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as TrackLeadBody | undefined
  if (!body || typeof body.anonId !== 'string' || typeof body.source !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'anonId and source are required' })
  }
  const anonId = body.anonId.trim().slice(0, 64)
  const source = body.source.trim().slice(0, 64)
  if (!anonId || !source) {
    throw createError({ statusCode: 400, statusMessage: 'anonId and source must be non-empty' })
  }

  const client = serverSupabaseServiceRole(event)
  const now = new Date().toISOString()

  const { data: visitor, error: vErr } = await client
    .from('visitors')
    .upsert({ anon_id: anonId, last_seen: now }, { onConflict: 'anon_id' })
    .select('id')
    .single()
  if (vErr) {
    throw createError({ statusCode: 500, statusMessage: `visitor upsert failed: ${vErr.message}` })
  }

  const { data: lead, error: lErr } = await client
    .from('leads')
    .insert({
      visitor_id: visitor.id,
      source,
      display_name: body.displayName?.slice(0, 128) ?? null,
      contact_value: body.contactValue?.slice(0, 512) ?? null,
      utm_source: body.utm?.utm_source?.slice(0, 128) ?? null,
      utm_medium: body.utm?.utm_medium?.slice(0, 128) ?? null,
      utm_campaign: body.utm?.utm_campaign?.slice(0, 128) ?? null,
      last_seen: now
    })
    .select('id')
    .single()
  if (lErr) {
    throw createError({ statusCode: 500, statusMessage: `lead insert failed: ${lErr.message}` })
  }

  await client.from('lead_events').insert({
    visitor_id: visitor.id,
    lead_id: lead.id,
    type: `lead_${source}`,
    target: body.contactValue ?? null,
    meta: {}
  })

  return { leadId: lead.id }
})
