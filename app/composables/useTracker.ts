import type { Utm } from '~/utils/utm'
import { EMPTY_UTM } from '~/utils/utm'

const ANON_COOKIE = 'wv_anon_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90d

function ensureAnonId(): string {
  const c = useCookie<string | null>(ANON_COOKIE, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
    path: '/'
  })
  if (!c.value) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
    c.value = id
  }
  return c.value as string
}

function isDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false
  const dnt =
    navigator.doNotTrack ?? (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack
  return dnt === '1' || dnt === 'yes'
}

export interface TrackEventInput {
  type: string
  target?: string | null
  path?: string | null
  meta?: Record<string, unknown>
  utm?: Utm
}

export interface TrackLeadInput {
  source: string
  displayName?: string | null
  contactValue?: string | null
  /** Associate lead with a dashboard project (e.g. public project landing). */
  projectId?: string | null
  utm?: Utm
}

export function useTracker() {
  const enabled = computed(() => {
    if (import.meta.server) return false
    if (isDoNotTrack()) return false
    const raw = (import.meta.env as Record<string, string | undefined>).VITE_TRACKING_ENABLED
    return raw !== 'false'
  })

  async function trackEvent(input: TrackEventInput): Promise<void> {
    if (!enabled.value) return
    try {
      const anonId = ensureAnonId()
      await $fetch('/api/track/event', {
        method: 'POST',
        body: {
          anonId,
          type: input.type,
          target: input.target ?? null,
          path: input.path ?? window.location.pathname,
          meta: input.meta ?? {},
          utm: input.utm ?? undefined,
          userAgent: navigator.userAgent,
          language: navigator.language,
          referrer: document.referrer || null
        },
        retry: 0
      })
    } catch {
      // tracking must never break UX
    }
  }

  async function trackLead(input: TrackLeadInput): Promise<string | null> {
    if (!enabled.value) return null
    try {
      const anonId = ensureAnonId()
      const res = await $fetch<{ leadId: string }>('/api/track/lead', {
        method: 'POST',
        body: {
          anonId,
          source: input.source,
          displayName: input.displayName ?? null,
          contactValue: input.contactValue ?? null,
          projectId: input.projectId ?? null,
          utm: input.utm ?? EMPTY_UTM
        },
        retry: 0
      })
      return res?.leadId ?? null
    } catch {
      return null
    }
  }

  return { enabled, trackEvent, trackLead }
}
