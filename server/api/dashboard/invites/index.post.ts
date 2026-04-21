import type { Database } from '~/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

interface Body {
  email?: string
  role?: UserRole
}

const VALID: UserRole[] = ['admin', 'editor', 'viewer']

// Simple in-memory bucket: max 20 invites / hour per admin.
const bucket = new Map<string, number[]>()

function allow(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const list = (bucket.get(userId) ?? []).filter((t) => now - t < windowMs)
  if (list.length >= 20) {
    bucket.set(userId, list)
    return false
  }
  list.push(now)
  bucket.set(userId, list)
  return true
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireAdmin(event)
  const body = (await readBody(event)) as Body | undefined
  const email = body?.email?.trim().toLowerCase()
  const role = body?.role ?? 'viewer'
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid email' })
  }
  if (!VALID.includes(role)) throw createError({ statusCode: 400, statusMessage: 'invalid role' })
  if (!allow(userId)) throw createError({ statusCode: 429, statusMessage: 'rate limit' })

  const service = serverSupabaseServiceRole(event)

  // Insert invites row first (trigger logs to audit_log).
  const { data: invite, error: iErr } = await service
    .from('invites')
    .insert({ email, role, created_by: userId })
    .select('*')
    .single()
  if (iErr) throw createError({ statusCode: 500, statusMessage: iErr.message })

  // Fire Supabase magic-link invite email.
  const origin =
    getRequestHeader(event, 'origin') ?? getRequestHeader(event, 'x-forwarded-host') ?? ''
  const redirectTo = origin ? `${origin}/confirm` : undefined
  const { error: aErr } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo
  })
  if (aErr) {
    // Surface but keep the row; admin can resend or revoke.
    return { invite, warning: aErr.message }
  }

  return { invite }
})
