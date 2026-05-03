import type { BurndownResult } from '~~/server/domain/dashboard/burndown'
import type { Project, Sprint, Task } from '~~/server/domain/dashboard/shared'

export interface CreateProjectInput {
  userId: string
  organizationId?: string
  name?: string
  slug?: string
  description?: string | null
  color?: string | null
}

export interface UpdateProjectInput {
  id: string
  userId: string
  name?: string
  slug?: string
  description?: string | null
  color?: string | null
  archived?: boolean
}

export interface CreateSprintInput {
  userId: string
  project_id?: string
  name?: string
  starts_at?: string
  ends_at?: string
  goal?: string | null
}

export interface UpdateSprintInput {
  id: string
  userId: string
  name?: string
  starts_at?: string
  ends_at?: string
  goal?: string | null
  close_now?: boolean
}

export interface CreateTaskInput {
  userId: string
  project_id?: string
  title?: string
  status?: 'todo' | 'doing' | 'review' | 'done'
  sprint_id?: string | null
  points?: number | null
}

export interface UpdateTaskInput {
  id: string
  userId: string
  status?: 'todo' | 'doing' | 'review' | 'done'
  position?: number
  title?: string
  description?: string | null
  points?: number | null
  assignee_id?: string | null
  sprint_id?: string | null
}

export interface ProjectsRepositoryPort {
  createProject(input: CreateProjectInput): Promise<Project>
  updateProject(input: UpdateProjectInput): Promise<Project>
}

export interface SprintsRepositoryPort {
  createSprint(input: CreateSprintInput): Promise<Sprint>
  updateSprint(input: UpdateSprintInput): Promise<Sprint>
}

export interface TasksRepositoryPort {
  createTask(input: CreateTaskInput): Promise<Task>
  updateTask(input: UpdateTaskInput): Promise<Task>
  deleteTask(input: { id: string; userId: string }): Promise<void>
}

export interface AgileRepositoryPort extends ProjectsRepositoryPort, SprintsRepositoryPort, TasksRepositoryPort {
  getBurndown(projectId: string, sprintId: string | null): Promise<BurndownResult>
}
