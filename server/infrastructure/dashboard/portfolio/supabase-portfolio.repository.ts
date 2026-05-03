import type { Service } from '~~/server/domain/dashboard/shared'
import type { PortfolioRepositoryPort } from '~~/server/domain/dashboard/portfolio/repositories'

export function createSupabasePortfolioRepository(service: Service): PortfolioRepositoryPort {
  return {
    async getPortfolioSnapshot(input) {
      let leadsQuery = service.from('leads').select('*').order('first_seen', { ascending: false }).limit(200)
      if (input.from) leadsQuery = leadsQuery.gte('first_seen', input.from)
      if (input.to) leadsQuery = leadsQuery.lt('first_seen', input.to)

      const [{ data: projects, error: projectsError }, { data: tasks, error: tasksError }, { data: leads, error: leadsError }] =
        await Promise.all([
          service.from('projects').select('*').order('updated_at', { ascending: false }).limit(100),
          service.from('tasks').select('*').order('updated_at', { ascending: false }).limit(300),
          leadsQuery
        ])

      if (projectsError) throw createError({ statusCode: 500, statusMessage: projectsError.message })
      if (tasksError) throw createError({ statusCode: 500, statusMessage: tasksError.message })
      if (leadsError) throw createError({ statusCode: 500, statusMessage: leadsError.message })

      return {
        projects: projects ?? [],
        tasks: tasks ?? [],
        leads: leads ?? []
      }
    }
  }
}
