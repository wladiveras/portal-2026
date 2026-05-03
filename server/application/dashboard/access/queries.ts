import { createAccessRepository } from '~~/server/infrastructure/dashboard/factory'
import type { H3Event } from '~~/server/domain/dashboard/shared'

export async function qryListProfiles(event: H3Event) {
  const repository = createAccessRepository(event)
  return repository.listProfiles()
}

export async function qryListInvites(event: H3Event) {
  const repository = createAccessRepository(event)
  return repository.listInvites()
}

export async function qryListAudit(event: H3Event, input: { limit?: number; cursor?: string }) {
  const repository = createAccessRepository(event)
  const limit = Math.min(100, Math.max(10, Number(input.limit) || 50))
  const rows = await repository.listAudit(limit + 1)
  const profiles = await repository.listProfiles()
  const labels = new Map<string, string>()
  for (const p of profiles) labels.set(p.id, p.full_name ?? p.email ?? p.id)
  const cursor = input.cursor
  const filtered = cursor ? rows.filter((row) => row.created_at < cursor) : rows
  const items = filtered.slice(0, limit).map((row) => ({
    ...row,
    actor_label: row.actor_id ? labels.get(row.actor_id) ?? row.actor_id : null
  }))
  const next_cursor = filtered.length > limit ? items[items.length - 1]?.created_at ?? null : null
  return { items, next_cursor }
}
