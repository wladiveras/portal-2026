import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'
import type { ProjectSummary } from '~~/server/api/dashboard/projects/index.get'
import type { ProjectDetailResponse } from '~~/server/api/dashboard/projects/[id]/index.get'

type Project = Database['public']['Tables']['projects']['Row']

interface CreateProjectInput {
  name: string
  slug: string
  description?: string | null
  color?: string | null
}

interface UpdateProjectInput extends CreateProjectInput {
  id: string
}

export const useDashboardProjectsStore = defineStore('dashboard-projects', {
  state: () => ({
    projects: [] as ProjectSummary[],
    details: {} as Record<string, ProjectDetailResponse>,
    loadingList: false,
    loadingDetailById: {} as Record<string, boolean>,
    saving: false,
    error: null as string | null
  }),
  getters: {
    projectById: (state) => (id: string): ProjectSummary | undefined =>
      state.projects.find((project) => project.id === id),
    detailById: (state) => (id: string): ProjectDetailResponse | null => state.details[id] ?? null
  },
  actions: {
    async fetchProjects() {
      this.loadingList = true
      this.error = null
      try {
        this.projects = await $fetch<ProjectSummary[]>('/api/dashboard/projects')
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Falha ao carregar projetos'
      } finally {
        this.loadingList = false
      }
    },
    async fetchProjectDetail(projectId: string) {
      this.loadingDetailById[projectId] = true
      this.error = null
      try {
        this.details[projectId] = await $fetch<ProjectDetailResponse>(
          `/api/dashboard/projects/${projectId}`
        )
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Falha ao carregar projeto'
      } finally {
        this.loadingDetailById[projectId] = false
      }
    },
    async createProject(input: CreateProjectInput) {
      this.saving = true
      this.error = null
      try {
        await $fetch<Project>('/api/dashboard/projects', { method: 'POST', body: input })
        await this.fetchProjects()
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Falha ao criar projeto'
        throw error
      } finally {
        this.saving = false
      }
    },
    async updateProject(input: UpdateProjectInput) {
      this.saving = true
      this.error = null
      try {
        await $fetch<Project>(`/api/dashboard/projects/${input.id}`, {
          method: 'PATCH',
          body: {
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            color: input.color ?? null
          }
        })
        await this.fetchProjects()
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Falha ao editar projeto'
        throw error
      } finally {
        this.saving = false
      }
    },
    async archiveProject(projectId: string) {
      this.saving = true
      this.error = null
      try {
        await $fetch(`/api/dashboard/projects/${projectId}`, {
          method: 'PATCH',
          body: { archived: true }
        })
        this.projects = this.projects.filter((project) => project.id !== projectId)
        delete this.details[projectId]
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : 'Falha ao arquivar projeto'
        throw error
      } finally {
        this.saving = false
      }
    }
  }
})
