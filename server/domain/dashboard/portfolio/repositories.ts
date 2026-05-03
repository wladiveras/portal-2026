import type { Database } from '~/types/database.types'

export type Project = Database['public']['Tables']['projects']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']

export interface PortfolioSnapshot {
  projects: Project[]
  tasks: Task[]
  leads: Lead[]
}

export interface PortfolioRepositoryPort {
  getPortfolioSnapshot(input: { actorId: string; from?: string; to?: string }): Promise<PortfolioSnapshot>
}
