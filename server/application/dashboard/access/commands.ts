import type { Database } from '~/types/database.types'
import { requireDashboardUserId } from '~~/server/application/dashboard/require-user'
import { createAccessRepository } from '~~/server/infrastructure/dashboard/factory'
import type { H3Event } from '~~/server/domain/dashboard/shared'
import type { H3Event as H3EventStrict } from 'h3'

type UserRole = Database['public']['Enums']['user_role']

const VALID: UserRole[] = ['admin', 'editor', 'viewer']

const AVATAR_MAX_BYTES = 2 * 1024 * 1024
const AVATAR_ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

export async function cmdUpdateProfile(
  event: H3Event,
  input: {
    profileId: string
    actorId: string
    role?: UserRole
    disabled?: boolean
    full_name?: string | null
  }
) {
  if (input.role && !VALID.includes(input.role)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid role' })
  }
  if (
    input.profileId === input.actorId &&
    ((input.role && input.role !== 'admin') || input.disabled === true)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'não pode alterar seu próprio role ou desativar-se'
    })
  }

  const patch: {
    role?: UserRole
    disabled?: boolean
    full_name?: string | null
  } = {}
  if (input.role !== undefined) patch.role = input.role
  if (input.disabled !== undefined) patch.disabled = input.disabled
  if (input.full_name !== undefined) patch.full_name = input.full_name

  const repository = createAccessRepository(event)
  return repository.updateProfile({
    profileId: input.profileId,
    patch,
    actorId: input.actorId
  })
}

export async function cmdCreateInvite(
  event: H3Event,
  input: {
    actorId: string
    email?: string
    role?: UserRole
    origin?: string
    forwardedHost?: string
  }
) {
  const email = input.email?.trim().toLowerCase()
  const role = input.role ?? 'viewer'
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid email' })
  }
  if (!VALID.includes(role)) throw createError({ statusCode: 400, statusMessage: 'invalid role' })

  const redirectTo = input.origin
    ? `${input.origin}/confirm`
    : input.forwardedHost
      ? `${input.forwardedHost}/confirm`
      : undefined

  const repository = createAccessRepository(event)
  return repository.createInvite({
    actorId: input.actorId,
    email,
    role,
    redirectTo
  })
}

export async function cmdRevokeInvite(
  event: H3Event,
  input: {
    actorId: string
    token?: string
  }
) {
  if (!input.token) throw createError({ statusCode: 400, statusMessage: 'token required' })
  const repository = createAccessRepository(event)
  await repository.revokeInvite({
    actorId: input.actorId,
    token: input.token
  })
}

export async function cmdUploadAvatar(
  event: H3EventStrict,
  input: { bytes: Uint8Array; mimeType: string; filename: string }
) {
  if (!input.bytes?.byteLength) throw createError({ statusCode: 400, statusMessage: 'avatar required' })
  if (!AVATAR_ALLOWED_MIME.has(input.mimeType)) {
    throw createError({ statusCode: 400, statusMessage: 'unsupported avatar type' })
  }
  if (input.bytes.byteLength > AVATAR_MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'avatar exceeds 2MB' })
  }
  const userId = await requireDashboardUserId(event)
  const repository = createAccessRepository(event)
  return repository.uploadAvatar({
    userId,
    bytes: input.bytes,
    mimeType: input.mimeType,
    filename: input.filename
  })
}
