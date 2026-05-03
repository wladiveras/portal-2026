const PUBLIC_EXACT = new Set(['/', '/login', '/confirm'])

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/dashboard')) return
  if (PUBLIC_EXACT.has(to.path)) return

  // Skip on SSR — the Supabase plugin populates `useSupabaseUser()` on the
  // client and the role middleware will re-run there.
  if (import.meta.server) return

  const user = useSupabaseUser()
  if (user.value) return

  return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
