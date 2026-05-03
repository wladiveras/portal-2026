type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme.override'

function safeWindow(): Window | null {
  return typeof window === 'undefined' ? null : window
}

function getSystemTheme(): ThemeMode {
  const w = safeWindow()
  if (!w) return 'light'
  return w.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveInitialTheme(): ThemeMode {
  const w = safeWindow()
  if (!w) return 'light'
  const saved = w.localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return getSystemTheme()
}

function applyTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode
}

export function useTheme() {
  const mode = useState<ThemeMode>('theme:mode', () => 'light')
  const hasManualOverride = useState<boolean>('theme:manual', () => false)
  const initialized = useState<boolean>('theme:initialized', () => false)

  function setMode(next: ThemeMode, persist = true) {
    mode.value = next
    applyTheme(next)
    hasManualOverride.value = persist

    const w = safeWindow()
    if (!w) return
    if (persist) w.localStorage.setItem(STORAGE_KEY, next)
    else w.localStorage.removeItem(STORAGE_KEY)
  }

  function toggle() {
    setMode(mode.value === 'dark' ? 'light' : 'dark', true)
  }

  function syncWithSystemIfNeeded() {
    if (hasManualOverride.value) return
    setMode(getSystemTheme(), false)
  }

  function init() {
    if (initialized.value) return
    initialized.value = true

    const w = safeWindow()
    const initial = resolveInitialTheme()
    setMode(initial, Boolean(w?.localStorage.getItem(STORAGE_KEY)))
  }

  if (import.meta.client) {
    onMounted(() => {
      init()
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => syncWithSystemIfNeeded()
      media.addEventListener('change', listener)
      onBeforeUnmount(() => media.removeEventListener('change', listener))
    })
  }

  return {
    mode,
    toggle,
    setMode,
    hasManualOverride
  }
}
