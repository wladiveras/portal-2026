/**
 * Deterministic Supabase seed for Playwright runs (requires service role URL + key).
 *
 * Invoke:
 *   npx tsx scripts/seed/e2e.ts
 *
 * Env: PLAYWRIGHT_SUPABASE_URL, PLAYWRIGHT_SUPABASE_SERVICE_KEY (+ optional PLAYWRIGHT_* overrides).
 */

import { seedE2EData } from '../../e2e/seed/supabase.seed'

seedE2EData().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
