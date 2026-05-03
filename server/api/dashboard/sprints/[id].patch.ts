import { cmdUpdateSprint } from '~~/server/application/dashboard/agile/commands'

interface Body {
  name?: string
  starts_at?: string
  ends_at?: string
  goal?: string | null
  close_now?: boolean
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const { userId } = await requireEditorOrAdmin(event)
  const body = (await readBody(event)) as Body | undefined
  if (!body) throw createError({ statusCode: 400, statusMessage: 'body required' })
  return cmdUpdateSprint(event, { id, userId, ...body })
})
