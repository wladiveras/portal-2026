/**
 * Application-layer commands for dashboard agile context (projects / sprints / tasks).
 * Nitro handlers delegate here instead of calling domain/repository code directly (DDD-08).
 *
 * Cross-cutting concerns (audit, authz) remain enforced in guards + domain services;
 * this layer is the stable orchestration seam for HTTP adapters (DDD-09 evolution).
 */

import type { H3Event } from '~~/server/domain/dashboard/shared'
import { type AgileRepositoryPort } from '~~/server/domain/dashboard/projects/repositories'
import type {
  CreateProjectInput,
  CreateSprintInput,
  CreateTaskInput,
  UpdateProjectInput,
  UpdateSprintInput,
  UpdateTaskInput
} from '~~/server/domain/dashboard/projects/repositories'
import { createAgileRepository } from '~~/server/infrastructure/dashboard/factory'

function getRepository(event: H3Event, repository?: AgileRepositoryPort): AgileRepositoryPort {
  return repository ?? createAgileRepository(event)
}

export async function cmdCreateProject(
  event: H3Event,
  input: CreateProjectInput,
  repository?: AgileRepositoryPort
) {
  return getRepository(event, repository).createProject(input)
}

export async function cmdUpdateProject(
  event: H3Event,
  input: UpdateProjectInput,
  repository?: AgileRepositoryPort
) {
  return getRepository(event, repository).updateProject(input)
}

export async function cmdCreateSprint(
  event: H3Event,
  input: CreateSprintInput,
  repository?: AgileRepositoryPort
) {
  return getRepository(event, repository).createSprint(input)
}

export async function cmdUpdateSprint(
  event: H3Event,
  input: UpdateSprintInput,
  repository?: AgileRepositoryPort
) {
  return getRepository(event, repository).updateSprint(input)
}

export async function cmdCreateTask(event: H3Event, input: CreateTaskInput, repository?: AgileRepositoryPort) {
  return getRepository(event, repository).createTask(input)
}

export async function cmdUpdateTask(event: H3Event, input: UpdateTaskInput, repository?: AgileRepositoryPort) {
  return getRepository(event, repository).updateTask(input)
}

export async function cmdDeleteTask(
  event: H3Event,
  input: { id: string; userId: string },
  repository?: AgileRepositoryPort
) {
  return getRepository(event, repository).deleteTask(input)
}
