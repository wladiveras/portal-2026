/**
 * Pure burndown series from sprint window + task completion dates (no I/O).
 */

export interface BurndownPoint {
  date: string
  ideal: number
  actual: number
}

export interface BurndownResult {
  sprint_id: string | null
  total_points: number
  points: BurndownPoint[]
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function buildBurndownResult(
  sprint: { id: string; starts_at: string; ends_at: string } | null,
  taskRows: Array<{ points: number | null; done_at: string | null }>
): BurndownResult {
  if (!sprint) {
    return { sprint_id: null, total_points: 0, points: [] }
  }

  const totalPoints = taskRows.reduce((acc, t) => acc + (t.points ?? 0), 0)

  const start = new Date(sprint.starts_at)
  const end = new Date(sprint.ends_at)
  const days: Date[] = []
  for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }

  const today = new Date()

  const points: BurndownPoint[] = days.map((d, i) => {
    const ideal = Math.max(0, totalPoints - (i * totalPoints) / Math.max(1, days.length - 1))
    let completed = 0
    for (const t of taskRows) {
      if (!t.done_at) continue
      if (new Date(t.done_at) <= new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)) {
        completed += t.points ?? 0
      }
    }
    const actual = d <= today ? totalPoints - completed : totalPoints
    return { date: isoDay(d), ideal: Math.round(ideal), actual: Math.round(actual) }
  })

  return { sprint_id: sprint.id, total_points: totalPoints, points }
}
