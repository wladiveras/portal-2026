import type { Database } from '~/types/database.types'

export type Note = Database['public']['Tables']['notes']['Row']

export interface NotesRepositoryPort {
  list(): Promise<Note[]>
  create(input: { userId: string; body: string }): Promise<Note>
  updatePinned(input: { id: string; pinned: boolean }): Promise<Note>
  deleteById(id: string): Promise<void>
}
