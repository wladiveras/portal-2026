import type { H3Event } from '~~/server/domain/dashboard/shared'
import type { LeadStatus } from '~~/server/domain/dashboard/leads/repositories'
import { createLeadsRepository } from '~~/server/infrastructure/dashboard/factory'

const VALID_STATUS: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

export async function cmdUpdateLeadStatus(
  event: H3Event,
  input: { id: string; actorId: string; status?: string }
) {
  const status = input.status as LeadStatus | undefined
  if (!status || !VALID_STATUS.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid status' })
  }
  const repository = createLeadsRepository(event)
  return repository.updateStatus({
    id: input.id,
    actorId: input.actorId,
    status
  })
}

export async function cmdAddLeadNote(
  event: H3Event,
  input: { leadId: string; actorId: string; body?: string }
) {
  const body = input.body?.trim() ?? ''
  if (!body || body.length > 4000) {
    throw createError({ statusCode: 400, statusMessage: 'body must be 1..4000 chars' })
  }
  const repository = createLeadsRepository(event)
  return repository.addNote({
    leadId: input.leadId,
    actorId: input.actorId,
    body
  })
}

export async function cmdDeleteLead(event: H3Event, input: { id: string; actorId: string }) {
  const repository = createLeadsRepository(event)
  await repository.deleteById(input)
}
