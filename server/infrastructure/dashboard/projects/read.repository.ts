import { desc, eq, inArray } from 'drizzle-orm'
import { projects, sprints, tasks } from '~~/server/db/schema'
import { tryGetDrizzle } from '~~/server/db/client'
import type { Database } from '~/types/database.types'
import type { ProjectSummary } from '~~/server/api/dashboard/projects/index.get'
import type { ProjectDetailResponse } from '~~/server/api/dashboard/projects/[id]/index.get'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']
type Event = Parameters<typeof serverSupabaseServiceRole>[0]

function toProjectRow(row: {
  id: string
  organization_id: string
  owner_id: string | null
  name: string
  slug: string
  description: string | null
  color: string | null
  archived: boolean
  created_at: string
  updated_at: string
}): Project {
  return row
}

function toTaskRow(row: {
  id: string
  project_id: string
  sprint_id: string | null
  story_id: string | null
  title: string
  description: string | null
  status: Database['public']['Enums']['task_status']
  points: number | null
  assignee_id: string | null
  position: number
  done_at: string | null
  created_at: string
  updated_at: string
}): Task {
  return row
}

function toSprintRow(row: {
  id: string
  project_id: string
  name: string
  starts_at: string
  ends_at: string
  goal: string | null
  created_at: string
}): Sprint {
  return row
}

export async function listProjectSummariesFromRepository(event: Event) {
  const db = tryGetDrizzle()
  if (!db) {
    const client = serverSupabaseServiceRole(event)
    const { data: projectRows, error } = await client
      .from('projects')
      .select('*')
      .eq('archived', false)
      .order('updated_at', { ascending: false })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    if (!projectRows?.length) return [] as ProjectSummary[]

    const ids = projectRows.map((project) => project.id)
    const { data: counts } = await client.from('tasks').select('project_id, status').in('project_id', ids)
    const aggregate = new Map<string, { total: number; done: number }>()
    for (const row of counts ?? []) {
      const bucket = aggregate.get(row.project_id) ?? { total: 0, done: 0 }
      bucket.total += 1
      if (row.status === 'done') bucket.done += 1
      aggregate.set(row.project_id, bucket)
    }
    return projectRows.map((project) => ({
      ...(project as Project),
      tasks_total: aggregate.get(project.id)?.total ?? 0,
      tasks_done: aggregate.get(project.id)?.done ?? 0
    }))
  }

  const projectRows = await db
    .select({
      id: projects.id,
      organization_id: projects.organizationId,
      owner_id: projects.ownerId,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      color: projects.color,
      archived: projects.archived,
      created_at: projects.createdAt,
      updated_at: projects.updatedAt
    })
    .from(projects)
    .where(eq(projects.archived, false))
    .orderBy(desc(projects.updatedAt))

  if (!projectRows.length) return [] as ProjectSummary[]

  const ids = projectRows.map((project) => project.id)
  const countRows = await db
    .select({ project_id: tasks.projectId, status: tasks.status })
    .from(tasks)
    .where(inArray(tasks.projectId, ids))

  const aggregate = new Map<string, { total: number; done: number }>()
  for (const row of countRows) {
    const bucket = aggregate.get(row.project_id) ?? { total: 0, done: 0 }
    bucket.total += 1
    if (row.status === 'done') bucket.done += 1
    aggregate.set(row.project_id, bucket)
  }

  return projectRows.map((project) => ({
    ...toProjectRow(project),
    tasks_total: aggregate.get(project.id)?.total ?? 0,
    tasks_done: aggregate.get(project.id)?.done ?? 0
  }))
}

export async function getProjectDetailFromRepository(
  event: Event,
  id: string
): Promise<ProjectDetailResponse> {
  const db = tryGetDrizzle()
  if (!db) {
    const client = serverSupabaseServiceRole(event)
    const [{ data: project, error: pErr }, { data: taskRows, error: tErr }, { data: sprintRows, error: sErr }] =
      await Promise.all([
        client.from('projects').select('*').eq('id', id).maybeSingle(),
        client
          .from('tasks')
          .select('*')
          .eq('project_id', id)
          .order('status', { ascending: true })
          .order('position', { ascending: true }),
        client.from('sprints').select('*').eq('project_id', id).order('starts_at', { ascending: false })
      ])
    if (pErr) throw createError({ statusCode: 500, statusMessage: pErr.message })
    if (!project) throw createError({ statusCode: 404, statusMessage: 'project not found' })
    if (tErr) throw createError({ statusCode: 500, statusMessage: tErr.message })
    if (sErr) throw createError({ statusCode: 500, statusMessage: sErr.message })
    return {
      project: project as Project,
      tasks: (taskRows ?? []) as Task[],
      sprints: (sprintRows ?? []) as Sprint[]
    }
  }

  const [projectRow] = await db
    .select({
      id: projects.id,
      organization_id: projects.organizationId,
      owner_id: projects.ownerId,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      color: projects.color,
      archived: projects.archived,
      created_at: projects.createdAt,
      updated_at: projects.updatedAt
    })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)
  if (!projectRow) throw createError({ statusCode: 404, statusMessage: 'project not found' })

  const [taskRows, sprintRows] = await Promise.all([
    db
      .select({
        id: tasks.id,
        project_id: tasks.projectId,
        sprint_id: tasks.sprintId,
        story_id: tasks.storyId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        points: tasks.points,
        assignee_id: tasks.assigneeId,
        position: tasks.position,
        done_at: tasks.doneAt,
        created_at: tasks.createdAt,
        updated_at: tasks.updatedAt
      })
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .orderBy(tasks.status, tasks.position),
    db
      .select({
        id: sprints.id,
        project_id: sprints.projectId,
        name: sprints.name,
        starts_at: sprints.startsAt,
        ends_at: sprints.endsAt,
        goal: sprints.goal,
        created_at: sprints.createdAt
      })
      .from(sprints)
      .where(eq(sprints.projectId, id))
      .orderBy(desc(sprints.startsAt))
  ])

  return {
    project: toProjectRow(projectRow),
    tasks: taskRows.map(toTaskRow),
    sprints: sprintRows.map(toSprintRow)
  }
}
