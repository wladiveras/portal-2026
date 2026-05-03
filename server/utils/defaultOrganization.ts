import type { Service } from '~~/server/domain/dashboard/shared'
import { eq } from 'drizzle-orm'
import { organizations } from '~~/server/db/schema'
import { tryGetDrizzle } from '~~/server/db/client'

export const DEFAULT_ORGANIZATION_SLUG = 'default'

export async function getDefaultOrganizationIdFromService(service: Service): Promise<string> {
  const { data, error } = await service.from('organizations').select('id').eq('slug', DEFAULT_ORGANIZATION_SLUG).maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!data?.id) {
    throw createError({
      statusCode: 500,
      statusMessage: 'default organization missing; apply migration 0008_organizations.sql'
    })
  }
  return data.id
}

export async function getDefaultOrganizationIdFromEvent(event: Parameters<typeof serverSupabaseServiceRole>[0]): Promise<string> {
  const db = tryGetDrizzle()
  if (db) {
    const [row] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, DEFAULT_ORGANIZATION_SLUG))
      .limit(1)
    if (!row?.id) {
      throw createError({
        statusCode: 500,
        statusMessage: 'default organization missing; apply migration 0008_organizations.sql'
      })
    }
    return row.id
  }
  const service = serverSupabaseServiceRole(event)
  return getDefaultOrganizationIdFromService(service)
}
