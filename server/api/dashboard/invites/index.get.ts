import type { Database } from '~/types/database.types'

type Invite = Database['public']['Tables']['invites']['Row']

export default defineEventHandler(async (event): Promise<Invite[]> => {
  await requireAdmin(event)
  const service = serverSupabaseServiceRole(event)
  const { data, error } = await service
    .from('invites')
    .select('*')
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []) as Invite[]
})
