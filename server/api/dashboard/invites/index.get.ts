import type { Database } from '~/types/database.types'
import { qryListInvites } from '~~/server/application/dashboard/access/queries'

type Invite = Database['public']['Tables']['invites']['Row']

export default defineEventHandler(async (event): Promise<Invite[]> => {
  await requireAdmin(event)
  return (await qryListInvites(event)) as Invite[]
})
