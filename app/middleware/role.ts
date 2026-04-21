import type { UserRole } from '~/types/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const required = to.meta.role as UserRole | UserRole[] | undefined
  if (!required) return

  const { profile, load } = useRole()
  if (!profile.value) await load(true)

  const role = profile.value?.role
  const allowed = Array.isArray(required) ? required : [required]

  if (!role || !allowed.includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }
})
