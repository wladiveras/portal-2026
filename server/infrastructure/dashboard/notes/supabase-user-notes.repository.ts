import type { Service } from '~~/server/domain/dashboard/shared'
import type { Note, NotesRepositoryPort } from '~~/server/domain/dashboard/notes/repositories'

export function createSupabaseUserNotesRepository(service: Service): NotesRepositoryPort {
  return {
    async list() {
      const { data, error } = await service
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return (data ?? []) as Note[]
    },

    async create(input) {
      const { data, error } = await service
        .from('notes')
        .insert({ user_id: input.userId, body: input.body })
        .select('*')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data as Note
    },

    async updatePinned(input) {
      const { data, error } = await service
        .from('notes')
        .update({ pinned: input.pinned })
        .eq('id', input.id)
        .select('*')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data as Note
    },

    async deleteById(id) {
      const { error } = await service.from('notes').delete().eq('id', id)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    }
  }
}
