import { expect, test } from '@playwright/test'
import { loginWithPassword } from './helpers/auth'

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD
const viewerEmail = process.env.PLAYWRIGHT_VIEWER_EMAIL
const viewerPassword = process.env.PLAYWRIGHT_VIEWER_PASSWORD
const canRun = Boolean(adminEmail && adminPassword && viewerEmail && viewerPassword)

test.describe('dashboard rbac navigation flow', () => {
  test.skip(!canRun, 'requires PLAYWRIGHT_* email/password envs')

  test('admin reaches access page from dashboard shell', async ({ page }) => {
    await loginWithPassword(page, {
      email: adminEmail!,
      password: adminPassword!,
      redirectTo: '/dashboard'
    })

    await page.getByRole('link', { name: /acessos/i }).click()
    await expect(page).toHaveURL(/\/dashboard\/access/)
    await expect(page.getByRole('heading', { name: /quem pode entrar/i })).toBeVisible()
  })

  test('viewer is blocked from direct access-management URL', async ({ page }) => {
    await loginWithPassword(page, {
      email: viewerEmail!,
      password: viewerPassword!,
      redirectTo: '/dashboard/access'
    })

    await expect(page.getByText(/sem permissão|acesso negado/i)).toBeVisible()
  })
})
