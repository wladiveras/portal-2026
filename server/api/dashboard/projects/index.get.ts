import type { Database } from '~/types/database.types'
import { qryListProjectSummaries } from '~~/server/application/dashboard/agile/queries'

type Project = Database['public']['Tables']['projects']['Row']

export interface ProjectSummary extends Project {
  tasks_total: number
  tasks_done: number
}

export default defineEventHandler(async (event): Promise<ProjectSummary[]> => {
  return qryListProjectSummaries(event)
})
