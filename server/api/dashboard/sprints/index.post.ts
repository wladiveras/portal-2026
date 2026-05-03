import { cmdCreateSprint } from '~~/server/application/dashboard/agile/commands'

export default defineEventHandler(async (event) => {
  const { userId } = await requireEditorOrAdmin(event)
  const body = (await readBody(event)) as {
    project_id?: string
    name?: string
    starts_at?: string
    ends_at?: string
    goal?: string | null
  } | undefined
  return cmdCreateSprint(event, { userId, ...body })
})
