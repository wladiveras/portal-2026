import type { H3Event } from '~~/server/domain/dashboard/shared'
import { tryGetDrizzle } from '~~/server/db/client'
import type {
  AccessRepositoryPort
} from '~~/server/domain/dashboard/access/repositories'
import type {
  LeadsRepositoryPort
} from '~~/server/domain/dashboard/leads/repositories'
import type {
  PortfolioRepositoryPort
} from '~~/server/domain/dashboard/portfolio/repositories'
import type { AgileRepositoryPort } from '~~/server/domain/dashboard/projects/repositories'
import type {
  TrackingRepositoryPort
} from '~~/server/domain/dashboard/tracking/repositories'
import { createDrizzleAgileRepository } from '~~/server/infrastructure/dashboard/projects/drizzle-projects.repository'
import { createSupabaseAgileRepository } from '~~/server/infrastructure/dashboard/projects/supabase-projects.repository'
import { createSupabaseLeadsRepository } from '~~/server/infrastructure/dashboard/leads/supabase-leads.repository'
import { createSupabaseAccessRepository } from '~~/server/infrastructure/dashboard/access/supabase-access.repository'
import { createSupabaseTrackingRepository } from '~~/server/infrastructure/dashboard/tracking/supabase-tracking.repository'
import { createSupabasePortfolioRepository } from '~~/server/infrastructure/dashboard/portfolio/supabase-portfolio.repository'

export function createAgileRepository(event: H3Event): AgileRepositoryPort {
  if (tryGetDrizzle()) {
    return createDrizzleAgileRepository(event)
  }
  return createSupabaseAgileRepository(serverSupabaseServiceRole(event))
}

// Phase 18-02/18-03: remaining contexts will gain concrete adapters.
export function createLeadsRepository(event: H3Event): LeadsRepositoryPort {
  return createSupabaseLeadsRepository(serverSupabaseServiceRole(event))
}

export function createAccessRepository(event: H3Event): AccessRepositoryPort {
  return createSupabaseAccessRepository(serverSupabaseServiceRole(event))
}

export function createTrackingRepository(event: H3Event): TrackingRepositoryPort {
  return createSupabaseTrackingRepository(serverSupabaseServiceRole(event))
}

export function createPortfolioRepository(event: H3Event): PortfolioRepositoryPort {
  return createSupabasePortfolioRepository(serverSupabaseServiceRole(event))
}
