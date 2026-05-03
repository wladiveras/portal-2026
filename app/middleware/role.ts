import type { UserRole } from '~/types/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const required = to.meta.role as UserRole | UserRole[] | undefined
  if (!required) return

  // SSR: skip auth checks server-side; the global auth middleware handles
  // unauth redirect, and the client side will re-run this middleware with
  // a fully hydrated Supabase session.
  if (import.meta.server) return

  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  const { ensureProfile } = useRole()
  const profile = await ensureProfile(4000)

  if (!profile) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Não consegui carregar seu perfil. Recarregue a página ou refaça o login.'
    })
  }

  if (profile.disabled) {
    throw createError({ statusCode: 403, statusMessage: 'Conta desativada' })
  }

  const allowed = Array.isArray(required) ? required : [required]
  if (!allowed.includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }
})
