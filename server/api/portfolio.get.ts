import { defineEventHandler } from 'h3'

import { qryPortfolioPayload } from '~~/server/application/dashboard/portfolio/queries'

export default defineEventHandler(() => qryPortfolioPayload())
