import { cmdUpdateProject } from '~~/server/application/dashboard/agile/commands'

interface Body {
  name?: string
  slug?: string
  description?: string | null
  color?: string | null
  archived?: boolean
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const { userId } = await requireEditorOrAdmin(event)
  const body = (await readBody(event)) as Body | undefined
  if (!body) throw createError({ statusCode: 400, statusMessage: 'body required' })
  return cmdUpdateProject(event, { id, userId, ...body })
})
