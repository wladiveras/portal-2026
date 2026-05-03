import type { Json } from '~/types/database.types'
import { cmdUpsertLandingDraft } from '~~/server/application/dashboard/landing/commands'
import { requireEditorOrAdmin } from '~~/server/utils/requireEditorOrAdmin'

export default defineEventHandler(async (event) => {
  const { userId } = await requireEditorOrAdmin(event)
  const projectId = getRouterParam(event, 'id')
  if (!projectId) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = (await readBody(event)) as {
    draft_json?: unknown
    draftJson?: unknown
    slug?: string | null
  }

  const draftJson = body?.draft_json ?? body?.draftJson
  if (draftJson === undefined || draftJson === null || typeof draftJson !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'draft_json object required' })
  }

  return cmdUpsertLandingDraft(event, {
    projectId,
    userId,
    draftJson: draftJson as Json,
    slug: body?.slug ?? null
  })
})
