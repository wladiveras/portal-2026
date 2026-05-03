import type { Database } from '~/types/database.types'
import { qryListProfiles } from '~~/server/application/dashboard/access/queries'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface ProfileListItem extends Profile {
  email: string | null
  last_sign_in_at: string | null
}

export default defineEventHandler(async (event): Promise<ProfileListItem[]> => {
  await requireAdmin(event)
  const rows = await qryListProfiles(event)
  return rows.map((p) => ({
    ...(p as Profile),
    email: p.email,
    last_sign_in_at: p.last_sign_in_at
  }))
})
