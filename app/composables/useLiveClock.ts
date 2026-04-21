import { computed, onMounted, onUnmounted, ref } from 'vue'

export type Greeting = 'bom dia' | 'boa tarde' | 'boa noite'

export interface UseLiveClockOptions {
  /** How often to tick. Default 30s. */
  intervalMs?: number
  /** IANA timezone, default America/Sao_Paulo. */
  timezone?: string
  /** Inject a clock for tests. */
  now?: () => Date
}

const DEFAULT_INTERVAL = 30_000
const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

/**
 * Returns the canonical greeting for an hour in 24h notation.
 * Pure function so it can be unit-tested without mounting.
 */
export function greetingForHour(hour24: number): Greeting {
  if (hour24 >= 5 && hour24 < 12) return 'bom dia'
  if (hour24 >= 12 && hour24 < 18) return 'boa tarde'
  return 'boa noite'
}

function getHourInTimezone(date: Date, timezone: string): number {
  // `Intl.DateTimeFormat` is the only cross-platform timezone-aware API we can
  // rely on without a heavy lib (no luxon / date-fns-tz here).
  try {
    const fmt = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      hour12: false,
      timeZone: timezone
    })
    const text = fmt.format(date)
    const parsed = parseInt(text, 10)
    if (Number.isFinite(parsed)) return parsed === 24 ? 0 : parsed
  } catch {
    // fallback to local hour
  }
  return date.getHours()
}

export function useLiveClock(options: UseLiveClockOptions = {}) {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL
  const timezone = options.timezone ?? DEFAULT_TIMEZONE
  const nowFn = options.now ?? (() => new Date())

  const now = ref<Date>(nowFn())
  let timer: number | undefined

  function tick() {
    now.value = nowFn()
  }

  function start() {
    if (timer !== undefined) return
    tick()
    timer = window.setInterval(tick, intervalMs)
  }

  function stop() {
    if (timer === undefined) return
    window.clearInterval(timer)
    timer = undefined
  }

  function onVisibility() {
    if (typeof document === 'undefined') return
    if (document.visibilityState === 'visible') start()
    else stop()
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    start()
    document.addEventListener('visibilitychange', onVisibility)
  })

  onUnmounted(() => {
    stop()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibility)
    }
  })

  const hour = computed(() => getHourInTimezone(now.value, timezone))
  const greeting = computed<Greeting>(() => greetingForHour(hour.value))

  const formattedTime = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    }).format(now.value)
  )

  const formattedDate = computed(() =>
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: timezone
    }).format(now.value)
  )

  return { now, hour, greeting, formattedTime, formattedDate }
}
