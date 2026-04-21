const PUBLIC_EXACT = new Set(['/', '/login', '/confirm'])

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/dashboard')) return
  if (PUBLIC_EXACT.has(to.path)) return

  const user = useSupabaseUser()
  if (user.value) return

  return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
