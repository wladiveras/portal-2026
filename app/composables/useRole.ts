import { computed, watch } from 'vue'
import type { CanAction, Profile, UserRole } from '~/types/auth'

/**
 * Reactive access helper backed by Supabase `profiles`.
 * Caches the profile in `useState('profile')` so all dashboard components share a single fetch.
 */
export function useRole() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  const profile = useState<Profile | null>('profile', () => null)
  const loading = useState<boolean>('profile:loading', () => false)
  const error = useState<string | null>('profile:error', () => null)

  async function load(force = false) {
    if (!user.value) {
      profile.value = null
      return
    }
    if (profile.value && profile.value.id === user.value.id && !force) return
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await client
        .from('profiles')
        .select('id, full_name, avatar_url, role, disabled, created_at, updated_at')
        .eq('id', user.value.id)
        .maybeSingle<Profile>()
      if (err) throw err
      profile.value = data ?? null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Falha ao carregar perfil'
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  if (import.meta.client) {
    watch(
      user,
      () => {
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

  return { profile, role, isAdmin, isEditor, isViewer, loading, error, load, can }
}
