import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { useTracker } from '~/composables/useTracker'

const STORAGE_KEY = 'wv_sections_seen'

function loadSeen(): Set<string> {
  if (typeof sessionStorage === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function persistSeen(seen: Set<string>): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seen)))
  } catch {
    // quota or sandbox — ignore
  }
}

/**
 * Fires a single `section_in_view` event the first time `elRef` crosses the
 * visibility threshold per session. `id` is a stable semantic name like
 * `hero`, `work`, `contact-cta`.
 */
export function useSectionInView(elRef: Ref<HTMLElement | null>, id: string, threshold = 0.3) {
  const { trackEvent } = useTracker()
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elRef.value || typeof IntersectionObserver === 'undefined') return
    const seen = loadSeen()
    if (seen.has(id)) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (seen.has(id)) continue
          seen.add(id)
          persistSeen(seen)
          void trackEvent({ type: 'section_in_view', target: id, meta: { threshold } })
          observer?.disconnect()
          observer = null
          break
        }
      },
      { threshold }
    )
    observer.observe(elRef.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
}
