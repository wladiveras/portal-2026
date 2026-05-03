import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { H3Event } from 'h3'
import type { NotesRepositoryPort } from '~~/server/domain/dashboard/notes/repositories'
import { createSupabaseUserNotesRepository } from '~~/server/infrastructure/dashboard/notes/supabase-user-notes.repository'

export async function createNotesRepository(event: H3Event): Promise<NotesRepositoryPort> {
  const client = await serverSupabaseClient<Database>(event)
  return createSupabaseUserNotesRepository(client)
}
