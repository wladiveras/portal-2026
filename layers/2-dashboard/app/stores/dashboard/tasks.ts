import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'
import { useDashboardProjectsStore } from '~~/layers/2-dashboard/app/stores/dashboard/projects'
import type { ProjectDetailResponse } from '~~/server/api/dashboard/projects/[id]/index.get'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskStatus = Database['public']['Enums']['task_status']

interface CreateTaskInput {
  project_id: string
  title: string
  status?: TaskStatus
  sprint_id?: string | null
  points?: number | null
}

export const useDashboardTasksStore = defineStore('dashboard-tasks', {
  state: () => ({
    saving: false,
    error: null as string | null
  }),
  actions: {
    async createTask(input: CreateTaskInput) {
      const projects = useDashboardProjectsStore()
      projects.saving = true
      projects.error = null
      this.error = null
      try {
        await $fetch('/api/dashboard/tasks', { method: 'POST', body: input })
        await projects.fetchProjectDetail(input.project_id)
        await projects.fetchProjects()
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Falha ao criar task'
        projects.error = msg
        this.error = msg
        throw error
      } finally {
        projects.saving = false
      }
    },

    async updateTask(projectId: string, taskId: string, patch: Partial<Task>) {
      const projects = useDashboardProjectsStore()
      const detail = projects.details[projectId] as ProjectDetailResponse | undefined
      if (!detail) return

      const local = detail.tasks.find((task) => task.id === taskId)
      const snapshot = local ? { ...local } : null
      if (local) Object.assign(local, patch)

      projects.error = null
      this.error = null
      try {
        const updated = await $fetch<Task>(`/api/dashboard/tasks/${taskId}`, {
          method: 'PATCH',
          body: patch
        })
        const nextLocal = detail.tasks.find((task) => task.id === taskId)
        if (nextLocal) Object.assign(nextLocal, updated)
        await projects.fetchProjects()
      } catch (error: unknown) {
        if (local && snapshot) Object.assign(local, snapshot)
        const msg = error instanceof Error ? error.message : 'Falha ao atualizar task'
        projects.error = msg
        this.error = msg
        throw error
      }
    },

    async deleteTask(projectId: string, taskId: string) {
      const projects = useDashboardProjectsStore()
      const detail = projects.details[projectId]
      const snapshot = detail?.tasks ? [...detail.tasks] : []
      if (detail) detail.tasks = detail.tasks.filter((task) => task.id !== taskId)

      projects.error = null
      this.error = null
      try {
        await $fetch(`/api/dashboard/tasks/${taskId}`, { method: 'DELETE' })
        await projects.fetchProjects()
      } catch (error: unknown) {
        if (detail) detail.tasks = snapshot
        const msg = error instanceof Error ? error.message : 'Falha ao excluir task'
        projects.error = msg
        this.error = msg
        throw error
      }
    }
  }
})
