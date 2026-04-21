import type { Database } from '~/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']

export interface ProjectSummary extends Project {
  tasks_total: number
  tasks_done: number
}

export default defineEventHandler(async (event): Promise<ProjectSummary[]> => {
  const client = serverSupabaseServiceRole(event)

  const { data: projects, error } = await client
    .from('projects')
    .select('*')
    .eq('archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!projects || projects.length === 0) return []

  const ids = projects.map((p) => p.id)
  const { data: counts } = await client
    .from('tasks')
    .select('project_id, status')
    .in('project_id', ids)

  const aggregate = new Map<string, { total: number; done: number }>()
  for (const row of counts ?? []) {
    const bucket = aggregate.get(row.project_id) ?? { total: 0, done: 0 }
    bucket.total += 1
    if (row.status === 'done') bucket.done += 1
    aggregate.set(row.project_id, bucket)
  }

  return projects.map((p) => ({
    ...(p as Project),
    tasks_total: aggregate.get(p.id)?.total ?? 0,
    tasks_done: aggregate.get(p.id)?.done ?? 0
  }))
})
