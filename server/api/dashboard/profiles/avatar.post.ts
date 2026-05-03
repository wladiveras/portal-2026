import type { Database } from '~/types/database.types'
import { cmdUploadAvatar } from '~~/server/application/dashboard/access/commands'

type AvatarPatch = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'avatar_url'>

export default defineEventHandler(async (event): Promise<AvatarPatch> => {
  const parts = await readMultipartFormData(event)
  const avatar = parts?.find((part) => part.name === 'avatar')
  const bytes = avatar?.data?.byteLength ? new Uint8Array(avatar.data) : new Uint8Array(0)
  return cmdUploadAvatar(event, {
    bytes,
    mimeType: avatar?.type ?? '',
    filename: avatar?.filename ?? ''
  })
})
