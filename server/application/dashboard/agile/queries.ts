import type { H3Event } from '~~/server/domain/dashboard/shared'
import {
  getProjectDetailFromRepository,
  listProjectSummariesFromRepository
} from '~~/server/infrastructure/dashboard/projects/read.repository'
import { createAgileRepository } from '~~/server/infrastructure/dashboard/factory'

export async function qryListProjectSummaries(event: H3Event) {
  return listProjectSummariesFromRepository(event)
}

export async function qryGetProjectDetailById(event: H3Event, id: string) {
  return getProjectDetailFromRepository(event, id)
}

export async function qryGetBurndown(event: H3Event, projectId: string, sprintId: string | null) {
  const repo = createAgileRepository(event)
  return repo.getBurndown(projectId, sprintId)
}
