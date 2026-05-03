import type { Json } from '~/types/database.types'
import type { Service } from '~~/server/domain/dashboard/shared'
import type { TrackingRepositoryPort } from '~~/server/domain/dashboard/tracking/repositories'

export function createSupabaseTrackingRepository(service: Service): TrackingRepositoryPort {
  return {
    async recordBeaconEvent(input) {
      const now = new Date().toISOString()
      const visitorPatch = {
        anon_id: input.anonId,
        last_seen: now,
        user_agent: input.userAgent?.slice(0, 512) ?? null,
        language: input.language?.slice(0, 16) ?? null,
        referrer: input.referrer?.slice(0, 1024) ?? null,
        utm_source: input.utm?.utm_source?.slice(0, 128) ?? null,
        utm_medium: input.utm?.utm_medium?.slice(0, 128) ?? null,
        utm_campaign: input.utm?.utm_campaign?.slice(0, 128) ?? null,
        utm_content: input.utm?.utm_content?.slice(0, 128) ?? null,
        utm_term: input.utm?.utm_term?.slice(0, 128) ?? null
      }
      const { data: visitor, error: vErr } = await service
        .from('visitors')
        .upsert(visitorPatch, { onConflict: 'anon_id' })
        .select('id')
        .single()
      if (vErr) {
        throw createError({ statusCode: 500, statusMessage: `visitor upsert failed: ${vErr.message}` })
      }

      const { error: eErr } = await service.from('lead_events').insert({
        visitor_id: visitor.id,
        type: input.type,
        target: input.target?.slice(0, 512) ?? null,
        path: input.path?.slice(0, 512) ?? null,
        meta: (input.meta ?? {}) as Json
      })
      if (eErr) {
        throw createError({ statusCode: 500, statusMessage: `event insert failed: ${eErr.message}` })
      }
    },

    async recordLandingLead(input) {
      const now = new Date().toISOString()
      const { data: visitor, error: vErr } = await service
        .from('visitors')
        .upsert({ anon_id: input.anonId, last_seen: now }, { onConflict: 'anon_id' })
        .select('id')
        .single()
      if (vErr) {
        throw createError({ statusCode: 500, statusMessage: `visitor upsert failed: ${vErr.message}` })
      }

      const { data: lead, error: lErr } = await service
        .from('leads')
        .insert({
          visitor_id: visitor.id,
          source: input.source,
          display_name: input.displayName?.slice(0, 128) ?? null,
          contact_value: input.contactValue?.slice(0, 512) ?? null,
          project_id: input.projectId ?? null,
          utm_source: input.utm?.utm_source?.slice(0, 128) ?? null,
          utm_medium: input.utm?.utm_medium?.slice(0, 128) ?? null,
          utm_campaign: input.utm?.utm_campaign?.slice(0, 128) ?? null,
          last_seen: now
        })
        .select('id')
        .single()
      if (lErr) {
        throw createError({ statusCode: 500, statusMessage: `lead insert failed: ${lErr.message}` })
      }

      const { error: evErr } = await service.from('lead_events').insert({
        visitor_id: visitor.id,
        lead_id: lead.id,
        type: `lead_${input.source}`,
        target: input.contactValue ?? null,
        meta: {}
      })
      if (evErr) {
        throw createError({ statusCode: 500, statusMessage: `lead event insert failed: ${evErr.message}` })
      }

      return { leadId: lead.id }
    }
  }
}
