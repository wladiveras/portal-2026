import { cmdRecordBeaconEvent } from '~~/server/application/dashboard/tracking/commands'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  await cmdRecordBeaconEvent(event, body as never)
  setResponseStatus(event, 204)
  return null
})
