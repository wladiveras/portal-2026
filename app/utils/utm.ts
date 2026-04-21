/**
 * UTM / marketing params parser. Pure helper, no browser globals at call time
 * so it is safe to unit-test without a DOM.
 */
export interface Utm {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
}

export const EMPTY_UTM: Utm = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null
}

const KEYS: Array<keyof Utm> = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term'
]

export function parseUtmFromSearch(search: string): Utm {
  if (!search) return { ...EMPTY_UTM }
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const out: Utm = { ...EMPTY_UTM }
  for (const key of KEYS) {
    const raw = params.get(key)
    out[key] = raw?.trim() || null
  }
  return out
}

export function parseUtmFromUrl(url: string): Utm {
  try {
    const parsed = new URL(url, 'http://local')
    return parseUtmFromSearch(parsed.search)
  } catch {
    return { ...EMPTY_UTM }
  }
}

export function hasAnyUtm(utm: Utm): boolean {
  return KEYS.some((k) => utm[k] !== null)
}
