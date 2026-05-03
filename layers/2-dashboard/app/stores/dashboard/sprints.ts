import { defineStore } from 'pinia'
import { useDashboardProjectsStore } from '~~/layers/2-dashboard/app/stores/dashboard/projects'

interface CreateSprintInput {
  project_id: string
  name: string
  starts_at: string
  ends_at: string
  goal?: string | null
}

export const useDashboardSprintsStore = defineStore('dashboard-sprints', {
  state: () => ({
    saving: false,
    error: null as string | null
  }),
  actions: {
    async createSprint(input: CreateSprintInput) {
      const projects = useDashboardProjectsStore()
      projects.saving = true
      projects.error = null
      this.error = null
      try {
        await $fetch('/api/dashboard/sprints', { method: 'POST', body: input })
        await projects.fetchProjectDetail(input.project_id)
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Falha ao criar sprint'
        projects.error = msg
        this.error = msg
        throw error
      } finally {
        projects.saving = false
      }
    },

    async closeSprint(projectId: string, sprintId: string) {
      const projects = useDashboardProjectsStore()
      projects.saving = true
      projects.error = null
      this.error = null
      try {
        await $fetch(`/api/dashboard/sprints/${sprintId}`, {
          method: 'PATCH',
          body: { close_now: true }
        })
        await projects.fetchProjectDetail(projectId)
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Falha ao encerrar sprint'
        projects.error = msg
        this.error = msg
        throw error
      } finally {
        projects.saving = false
      }
    }
  }
})
