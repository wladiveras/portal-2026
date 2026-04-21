export interface BurndownPoint {
  date: string
  ideal: number
  actual: number
}

export interface BurndownResponse {
  sprint_id: string | null
  total_points: number
  points: BurndownPoint[]
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event): Promise<BurndownResponse> => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'project id required' })

  const query = getQuery(event)
  const sprintId = typeof query.sprint === 'string' ? query.sprint : null

  const client = serverSupabaseServiceRole(event)

  const { data: sprint } = sprintId
    ? await client.from('sprints').select('*').eq('id', sprintId).maybeSingle()
    : await client
        .from('sprints')
        .select('*')
        .eq('project_id', id)
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle()

  if (!sprint) return { sprint_id: null, total_points: 0, points: [] }

  const { data: tasks, error } = await client
    .from('tasks')
    .select('points, status, done_at')
    .eq('project_id', id)
    .eq('sprint_id', sprint.id)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const totalPoints = (tasks ?? []).reduce((acc, t) => acc + (t.points ?? 0), 0)

  const start = new Date(sprint.starts_at)
  const end = new Date(sprint.ends_at)
  const days: Date[] = []
  for (
    let d = new Date(start);
    d.getTime() <= end.getTime();
    d.setDate(d.getDate() + 1)
  ) {
    days.push(new Date(d))
  }

  const today = new Date()

  const points: BurndownPoint[] = days.map((d, i) => {
    const ideal = Math.max(0, totalPoints - (i * totalPoints) / Math.max(1, days.length - 1))
    let completed = 0
    for (const t of tasks ?? []) {
      if (!t.done_at) continue
      if (new Date(t.done_at) <= new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)) {
        completed += t.points ?? 0
      }
    }
    const actual = d <= today ? totalPoints - completed : totalPoints
    return { date: isoDay(d), ideal: Math.round(ideal), actual: Math.round(actual) }
  })

  return { sprint_id: sprint.id, total_points: totalPoints, points }
})
