import type { H3Event } from 'h3'
import type {
  TrackingBeaconInput,
  TrackingLandingLeadInput
} from '~~/server/domain/dashboard/tracking/repositories'
import { createTrackingRepository } from '~~/server/infrastructure/dashboard/factory'

const MAX_TYPE_LEN = 64
const MAX_ANON_LEN = 64

function trackingEvent(event: H3Event) {
  return createTrackingRepository(event as Parameters<typeof createTrackingRepository>[0])
}

export async function cmdRecordBeaconEvent(
  event: H3Event,
  raw: Partial<TrackingBeaconInput> & { userAgent?: string; language?: string; referrer?: string } | undefined
) {
  if (!raw || typeof raw.anonId !== 'string' || typeof raw.type !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'anonId and type are required' })
  }
  const anonId = raw.anonId.slice(0, MAX_ANON_LEN).trim()
  const type = raw.type.slice(0, MAX_TYPE_LEN).trim()
  if (!anonId || !type) {
    throw createError({ statusCode: 400, statusMessage: 'anonId and type must be non-empty' })
  }

  const repository = trackingEvent(event)
  await repository.recordBeaconEvent({
    anonId,
    type,
    target: raw.target,
    path: raw.path,
    meta: raw.meta,
    utm: raw.utm,
    userAgent: raw.userAgent,
    language: raw.language,
    referrer: raw.referrer
  })
}

export async function cmdRecordLandingLead(
  event: H3Event,
  raw: Partial<TrackingLandingLeadInput> | undefined
) {
  if (!raw || typeof raw.anonId !== 'string' || typeof raw.source !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'anonId and source are required' })
  }
  const anonId = raw.anonId.trim().slice(0, 64)
  const source = raw.source.trim().slice(0, 64)
  if (!anonId || !source) {
    throw createError({ statusCode: 400, statusMessage: 'anonId and source must be non-empty' })
  }

  const repository = trackingEvent(event)
  const projectId =
    typeof raw.projectId === 'string' && raw.projectId.trim().length > 0 ? raw.projectId.trim() : null

  return repository.recordLandingLead({
    anonId,
    source,
    displayName: raw.displayName,
    contactValue: raw.contactValue,
    projectId,
    utm: raw.utm
  })
}
