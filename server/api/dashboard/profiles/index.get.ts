import type { Database } from '~/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface ProfileListItem extends Profile {
  email: string | null
  last_sign_in_at: string | null
}

export default defineEventHandler(async (event): Promise<ProfileListItem[]> => {
  await requireAdmin(event)

  const service = serverSupabaseServiceRole(event)

  const { data: profiles, error } = await service
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Hydrate with auth.users via admin API.
  const { data: users } = await service.auth.admin.listUsers({ page: 1, perPage: 200 })
  const usersById = new Map<string, { email: string | null; last_sign_in_at: string | null }>()
  for (const u of users?.users ?? []) {
    usersById.set(u.id, {
      email: u.email ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null
    })
  }

  return (profiles ?? []).map((p) => ({
    ...(p as Profile),
    email: usersById.get(p.id)?.email ?? null,
    last_sign_in_at: usersById.get(p.id)?.last_sign_in_at ?? null
  }))
})
