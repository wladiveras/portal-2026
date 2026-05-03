import { logAudit } from '~~/server/utils/audit'
import { getDefaultOrganizationIdFromService } from '~~/server/utils/defaultOrganization'
import type { Project, ProjectUpdate, Service } from './shared'
import { sanitizeSlug } from './shared'

export interface CreateProjectInput {
  userId: string
  organizationId?: string
  name?: string
  slug?: string
  description?: string | null
  color?: string | null
}

export interface UpdateProjectInput {
  id: string
  userId: string
  name?: string
  slug?: string
  description?: string | null
  color?: string | null
  archived?: boolean
}

export async function createProjectDomain(service: Service, input: CreateProjectInput): Promise<Project> {
  const name = input.name?.trim()
  const rawSlug = input.slug?.trim() || name || ''
  const slug = sanitizeSlug(rawSlug)
  const description = input.description?.trim() || null
  const color = input.color?.trim() || null

  if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
  const organizationId = input.organizationId ?? (await getDefaultOrganizationIdFromService(service))

  const { data, error } = await service
    .from('projects')
    .insert({
      name: name.slice(0, 120),
      slug: slug.slice(0, 80),
      description: description ? description.slice(0, 1500) : null,
      color,
      organization_id: organizationId,
      owner_id: input.userId
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logAudit(service, {
    action: 'project_created',
    targetType: 'project',
    targetId: data.id,
    meta: { actor_user_id: input.userId, entity: 'project', action: 'insert' }
  })

  return data
}

export async function updateProjectDomain(service: Service, input: UpdateProjectInput): Promise<Project> {
  const patch: ProjectUpdate = {}

  if (input.name !== undefined) {
    const name = input.name.trim()
    if (!name) throw createError({ statusCode: 400, statusMessage: 'name required' })
    patch.name = name.slice(0, 120)
  }
  if (input.slug !== undefined) {
    const slug = sanitizeSlug(input.slug)
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug required' })
    patch.slug = slug.slice(0, 80)
  }
  if (input.description !== undefined) {
    patch.description = input.description?.trim() ? input.description.trim().slice(0, 1500) : null
  }
  if (input.color !== undefined) {
    patch.color = input.color?.trim() ? input.color.trim() : null
  }
  if (input.archived !== undefined) patch.archived = input.archived

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, statusMessage: 'no fields to update' })
  }

  const { data, error } = await service.from('projects').update(patch).eq('id', input.id).select('*').single()
  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logAudit(service, {
    action: patch.archived === true ? 'project_archived' : 'project_updated',
    targetType: 'project',
    targetId: input.id,
    meta: {
      actor_user_id: input.userId,
      entity: 'project',
      action: patch.archived === true ? 'archive' : 'update',
      fields: Object.keys(patch)
    }
  })

  return data
}
