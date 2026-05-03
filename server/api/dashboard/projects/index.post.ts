import { cmdCreateProject } from '~~/server/application/dashboard/agile/commands'

export default defineEventHandler(async (event) => {
  const { userId } = await requireEditorOrAdmin(event)
  const body = (await readBody(event)) as {
    name?: string
    slug?: string
    description?: string | null
    color?: string | null
  } | undefined
  return cmdCreateProject(event, { userId, ...body })
})
