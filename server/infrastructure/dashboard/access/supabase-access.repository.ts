import type { Service } from '~~/server/domain/dashboard/shared'
import type { AccessRepositoryPort } from '~~/server/domain/dashboard/access/repositories'

const AVATAR_BUCKET = 'avatars'
const MAX_FILE_BYTES = 2 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

function extensionFromFile(name: string, mimeType: string): string {
  const clean = name.trim().toLowerCase()
  if (clean.endsWith('.png')) return 'png'
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'jpg'
  if (clean.endsWith('.webp')) return 'webp'
  if (clean.endsWith('.gif')) return 'gif'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  return 'gif'
}

async function ensureAvatarBucket(service: Service) {
  const listed = await service.storage.listBuckets()
  if (listed.error) throw createError({ statusCode: 500, statusMessage: listed.error.message })
  const exists = listed.data?.some((bucket) => bucket.name === AVATAR_BUCKET)
  if (exists) return

  const created = await service.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_FILE_BYTES}`,
    allowedMimeTypes: [...ALLOWED_MIME]
  })
  if (created.error) throw createError({ statusCode: 500, statusMessage: created.error.message })
}

const inviteRateBucket = new Map<string, number[]>()

function canInvite(actorId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const current = (inviteRateBucket.get(actorId) ?? []).filter((t) => now - t < windowMs)
  if (current.length >= 20) {
    inviteRateBucket.set(actorId, current)
    return false
  }
  current.push(now)
  inviteRateBucket.set(actorId, current)
  return true
}

export function createSupabaseAccessRepository(service: Service): AccessRepositoryPort {
  return {
    async listProfiles() {
      const { data, error } = await service.from('profiles').select('*').order('created_at', { ascending: false })
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      const profiles = data ?? []
      const { data: users } = await service.auth.admin.listUsers({ page: 1, perPage: 200 })
      const usersById = new Map<string, { email: string | null; last_sign_in_at: string | null }>()
      for (const u of users?.users ?? []) {
        usersById.set(u.id, {
          email: u.email ?? null,
          last_sign_in_at: u.last_sign_in_at ?? null
        })
      }
      return profiles.map((p) => ({
        ...p,
        email: usersById.get(p.id)?.email ?? null,
        last_sign_in_at: usersById.get(p.id)?.last_sign_in_at ?? null
      }))
    },

    async updateProfile(input) {
      const { data, error } = await service
        .from('profiles')
        .update(input.patch)
        .eq('id', input.profileId)
        .select('*')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data
    },

    async uploadAvatar(input) {
      await ensureAvatarBucket(service)
      const ext = extensionFromFile(input.filename, input.mimeType)
      const path = `${input.userId}/${Date.now()}.${ext}`

      const uploaded = await service.storage
        .from(AVATAR_BUCKET)
        .upload(path, input.bytes, { upsert: true, contentType: input.mimeType })
      if (uploaded.error) throw createError({ statusCode: 500, statusMessage: uploaded.error.message })

      const publicUrl = service.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl

      const { data, error } = await service
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', input.userId)
        .select('id, avatar_url')
        .single()
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data
    },

    async listInvites() {
      const { data, error } = await service
        .from('invites')
        .select('*')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    },

    async createInvite(input) {
      if (!canInvite(input.actorId)) throw createError({ statusCode: 429, statusMessage: 'rate limit' })
      const { data: invite, error: insertError } = await service
        .from('invites')
        .insert({ email: input.email, role: input.role, created_by: input.actorId })
        .select('*')
        .single()
      if (insertError) throw createError({ statusCode: 500, statusMessage: insertError.message })

      const { error: inviteError } = await service.auth.admin.inviteUserByEmail(input.email, {
        redirectTo: input.redirectTo
      })
      if (inviteError) return { invite, warning: inviteError.message }
      return { invite }
    },

    async revokeInvite(input) {
      const { error } = await service.from('invites').delete().eq('token', input.token)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    },

    async listAudit(limit = 50) {
      const safeLimit = Math.min(100, Math.max(10, limit))
      const { data, error } = await service
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(safeLimit)
      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }
  }
}
