import type { Database } from '~/types/database.types'

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

  const client = serverSupabaseServiceRole(event)

  const [{ data: project, error: pErr }, { data: tasks, error: tErr }, { data: sprints, error: sErr }] =
    await Promise.all([
      client.from('projects').select('*').eq('id', id).maybeSingle(),
      client
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('status', { ascending: true })
        .order('position', { ascending: true }),
      client
        .from('sprints')
        .select('*')
        .eq('project_id', id)
        .order('starts_at', { ascending: false })
    ])

  if (pErr) throw createError({ statusCode: 500, statusMessage: pErr.message })
  if (!project) throw createError({ statusCode: 404, statusMessage: 'project not found' })
  if (tErr) throw createError({ statusCode: 500, statusMessage: tErr.message })
  if (sErr) throw createError({ statusCode: 500, statusMessage: sErr.message })

  return {
    project: project as Project,
    tasks: (tasks ?? []) as Task[],
    sprints: (sprints ?? []) as Sprint[]
  }
})
