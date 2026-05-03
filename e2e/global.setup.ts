import type { FullConfig } from '@playwright/test'
import { seedE2EData } from './seed/supabase.seed'

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const shouldSeed = process.env.PLAYWRIGHT_SEED === 'true'
  if (!shouldSeed) return
  await seedE2EData()
}
