import type { Database, Json } from '~/types/database.types'
import type { DashboardLeadDetailResponse } from '~~/server/api/dashboard/leads/[id]/index.get'

type LeadStatus = Database['public']['Enums']['lead_status']
type LeadNote = Database['public']['Tables']['lead_notes']['Row']
type NoteRow = Database['public']['Tables']['notes']['Row']
type ProjectLandingRow = Database['public']['Tables']['project_landing']['Row']

export interface DashboardLandingGetResponse {
  landing: ProjectLandingRow | null
  defaultSlug: string
}

export function useDashboardApi() {
  async function fetchLeadDetail(leadId: string) {
    const url = `/api/dashboard/leads/${leadId}`
    return $fetch<DashboardLeadDetailResponse>(url as string)
  }

  async function updateLeadStatus(leadId: string, status: LeadStatus) {
    const url = `/api/dashboard/leads/${leadId}/status`
    await $fetch(url as string, {
      method: 'PATCH',
      body: { status }
    })
  }

  async function addLeadNote(leadId: string, body: string) {
    const url = `/api/dashboard/leads/${leadId}/notes`
    return $fetch<LeadNote>(url as string, {
      method: 'POST',
      body: { body }
    })
  }

  async function deleteLead(leadId: string) {
    const url = `/api/dashboard/leads/${leadId}`
    await $fetch(url as string, { method: 'DELETE' })
  }

  async function uploadAvatar(file: File) {
    const form = new FormData()
    form.append('avatar', file)
    await ($fetch as unknown as (input: string, init?: Record<string, unknown>) => Promise<unknown>)(
      '/api/dashboard/profiles/avatar',
      {
        method: 'POST',
        body: form
      }
    )
  }

  async function listNotes() {
    return $fetch<NoteRow[]>('/api/dashboard/notes')
  }

  async function createNote(body: string) {
    return $fetch<NoteRow>('/api/dashboard/notes', {
      method: 'POST',
      body: { body }
    })
  }

  async function updateNotePinned(id: string, pinned: boolean) {
    const url = `/api/dashboard/notes/${id}`
    return $fetch<NoteRow>(url as string, {
      method: 'PATCH',
      body: { pinned }
    })
  }

  async function deleteNote(id: string) {
    const url = `/api/dashboard/notes/${id}`
    await $fetch(url as string, { method: 'DELETE' })
  }

  async function fetchProjectLanding(projectId: string) {
    const url = `/api/dashboard/projects/${projectId}/landing`
    return $fetch<DashboardLandingGetResponse>(url as string)
  }

  async function saveProjectLandingDraft(projectId: string, body: { draft_json: Json; slug?: string | null }) {
    const url = `/api/dashboard/projects/${projectId}/landing`
    return $fetch<ProjectLandingRow>(url as string, {
      method: 'PATCH',
      body
    })
  }

  async function publishProjectLanding(projectId: string) {
    const url = `/api/dashboard/projects/${projectId}/landing/publish`
    return $fetch<ProjectLandingRow>(url as string, { method: 'POST' })
  }

  return {
    fetchLeadDetail,
    updateLeadStatus,
    addLeadNote,
    deleteLead,
    uploadAvatar,
    listNotes,
    createNote,
    updateNotePinned,
    deleteNote,
    fetchProjectLanding,
    saveProjectLandingDraft,
    publishProjectLanding
  }
}
