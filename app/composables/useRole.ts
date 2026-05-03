import type { CanAction, Profile, UserRole } from '~/types/auth'

/**
 * Reactive access helper backed by Supabase `profiles`.
 *
 * Caches the profile in `useState('profile')` so all dashboard components
 * share a single fetch. Defensive against the well-known race where
 * `useSupabaseUser()` becomes truthy a tick before the underlying client
 * actually carries the JWT in REST calls — we always read the auth user
 * via `client.auth.getSession()` before querying.
 */
export function useRole() {
  const client = useSupabaseClient()
  const userRef = useSupabaseUser()
  const profile = useState<Profile | null>('profile', () => null)
  const loading = useState<boolean>('profile:loading', () => false)
  const error = useState<string | null>('profile:error', () => null)

  async function getActiveUserId(): Promise<string | null> {
    // Prefer the reactive ref when available; fall back to live session
    // (which holds the JWT cookie even when ref hasn't emitted yet).
    if (userRef.value?.id) return userRef.value.id
    try {
      const { data } = await client.auth.getSession()
      return data.session?.user?.id ?? null
    } catch {
      return null
    }
  }

  async function fetchProfile(uid: string): Promise<Profile | null> {
    const { data, error: err } = await client
      .from('profiles')
      .select('id, full_name, avatar_url, role, disabled, created_at, updated_at')
      .eq('id', uid)
      .maybeSingle<Profile>()
    if (err) throw err
    return data ?? null
  }

  async function load(force = false) {
    const uid = await getActiveUserId()
    if (!uid) {
      profile.value = null
      return
    }
    if (profile.value && profile.value.id === uid && !force) return
    loading.value = true
    error.value = null
    try {
      profile.value = await fetchProfile(uid)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Falha ao carregar perfil'
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Resolves once a profile for the current authenticated user is loaded,
   * or gives up after `timeoutMs`. Retries against `auth.getSession()` so
   * a transient missing JWT doesn't poison the result.
   */
  async function ensureProfile(timeoutMs = 3000): Promise<Profile | null> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() <= deadline) {
      const uid = await getActiveUserId()
      if (uid) {
        if (profile.value?.id === uid) return profile.value
        try {
          const fetched = await fetchProfile(uid)
          if (fetched) {
            profile.value = fetched
            return fetched
          }
        } catch (e: unknown) {
          error.value = e instanceof Error ? e.message : 'Falha ao carregar perfil'
        }
      }
      await new Promise((r) => setTimeout(r, 150))
    }
    return profile.value
  }

  if (import.meta.client) {
    watch(
      userRef,
      (next, prev) => {
        if (next?.id && next.id === prev?.id && profile.value?.id === next.id) return
        load().catch(() => {})
      },
      { immediate: true }
    )
  }

  const role = computed<UserRole | null>(() => profile.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'admin')
  const isEditor = computed(() => role.value === 'admin' || role.value === 'editor')
  const isViewer = computed(() => role.value !== null)

  function can(action: CanAction): boolean {
    switch (action) {
      case 'manage_users':
        return isAdmin.value
      case 'manage_projects':
      case 'edit_leads':
        return isEditor.value
      case 'delete_leads':
        return isAdmin.value
      case 'view_dashboard':
        return isViewer.value && !(profile.value?.disabled ?? false)
      default:
        return false
    }
  }

  return {
    profile,
    role,
    isAdmin,
    isEditor,
    isViewer,
    loading,
    error,
    user: userRef,
    load,
    ensureProfile,
    can
  }
}
