import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useDashboardTasksStore', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rolls back optimistic update when updateTask fails', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('boom')))
    const { useDashboardProjectsStore } = await import(
      '~~/layers/2-dashboard/app/stores/dashboard/projects'
    )
    const { useDashboardTasksStore } = await import(
      '~~/layers/2-dashboard/app/stores/dashboard/tasks'
    )
    const projects = useDashboardProjectsStore()
    const tasks = useDashboardTasksStore()

    projects.details.p1 = {
      project: {
        id: 'p1',
        owner_id: null,
        name: 'Projeto',
        slug: 'projeto',
        description: null,
        color: null,
        archived: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z'
      },
      tasks: [
        {
          id: 't1',
          project_id: 'p1',
          sprint_id: null,
          story_id: null,
          title: 'Task',
          description: null,
          status: 'todo',
          points: null,
          assignee_id: null,
          position: 1000,
          done_at: null,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z'
        }
      ],
      sprints: []
    }

    await expect(tasks.updateTask('p1', 't1', { status: 'done' })).rejects.toThrow('boom')
    expect(projects.details.p1.tasks[0]?.status).toBe('todo')
    expect(projects.error).toBe('boom')
  })

  it('restores removed task if deleteTask fails', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('delete failed')))
    const { useDashboardProjectsStore } = await import(
      '~~/layers/2-dashboard/app/stores/dashboard/projects'
    )
    const { useDashboardTasksStore } = await import(
      '~~/layers/2-dashboard/app/stores/dashboard/tasks'
    )
    const projects = useDashboardProjectsStore()
    const tasks = useDashboardTasksStore()

    projects.details.p1 = {
      project: {
        id: 'p1',
        owner_id: null,
        name: 'Projeto',
        slug: 'projeto',
        description: null,
        color: null,
        archived: false,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z'
      },
      tasks: [
        {
          id: 't1',
          project_id: 'p1',
          sprint_id: null,
          story_id: null,
          title: 'Task',
          description: null,
          status: 'todo',
          points: null,
          assignee_id: null,
          position: 1000,
          done_at: null,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z'
        }
      ],
      sprints: []
    }

    await expect(tasks.deleteTask('p1', 't1')).rejects.toThrow('delete failed')
    expect(projects.details.p1.tasks).toHaveLength(1)
    expect(projects.details.p1.tasks[0]?.id).toBe('t1')
  })
})
