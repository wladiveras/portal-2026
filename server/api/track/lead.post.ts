import { cmdRecordLandingLead } from '~~/server/application/dashboard/tracking/commands'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return cmdRecordLandingLead(event, body as never)
})
