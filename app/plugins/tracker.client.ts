import { parseUtmFromSearch } from '~/utils/utm'
import { useTracker } from '~/composables/useTracker'

/**
 * Sends a `page_view` on first client mount and on each route change.
 * Lives on `/` (landing) AND `/dashboard/**`; dashboard events are also useful.
 * Tracking disables automatically under `DNT=1` or `VITE_TRACKING_ENABLED=false`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { trackEvent } = useTracker()
  const router = useRouter()

  function emitPageView(path: string) {
    const utm =
      typeof window !== 'undefined' ? parseUtmFromSearch(window.location.search) : undefined
    void trackEvent({ type: 'page_view', path, utm })
  }

  nuxtApp.hook('app:mounted', () => {
    emitPageView(router.currentRoute.value.fullPath)
  })

  router.afterEach((to, from) => {
    if (to.fullPath === from.fullPath) return
    emitPageView(to.fullPath)
  })
})
