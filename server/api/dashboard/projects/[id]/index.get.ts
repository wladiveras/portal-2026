import type { Database } from '~/types/database.types'
import { qryGetProjectDetailById } from '~~/server/application/dashboard/agile/queries'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']

export interface ProjectDetailResponse {
  project: Project
  tasks: Task[]
  sprints: Sprint[]
}

export default defineEventHandler(async (event): Promise<ProjectDetailResponse> => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })
  return qryGetProjectDetailById(event, id)
})
