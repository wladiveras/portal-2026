import { expect, test } from '@playwright/test'
import { loginWithPassword } from './helpers/auth'

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD
const editorEmail = process.env.PLAYWRIGHT_EDITOR_EMAIL
const editorPassword = process.env.PLAYWRIGHT_EDITOR_PASSWORD
const viewerEmail = process.env.PLAYWRIGHT_VIEWER_EMAIL
const viewerPassword = process.env.PLAYWRIGHT_VIEWER_PASSWORD
const canRunAuthE2E = Boolean(
  adminEmail &&
    adminPassword &&
    editorEmail &&
    editorPassword &&
    viewerEmail &&
    viewerPassword
)

test.describe('dashboard authenticated RBAC', () => {
  test.skip(!canRunAuthE2E, 'requires PLAYWRIGHT_* email/password envs')

  test('admin can access access-management page', async ({ page }) => {
    await loginWithPassword(page, {
      email: adminEmail!,
      password: adminPassword!,
      redirectTo: '/dashboard/access'
    })

    await expect(page.getByRole('heading', { name: /quem pode entrar/i })).toBeVisible()
  })

  test('editor cannot access access-management page', async ({ page }) => {
    await loginWithPassword(page, {
      email: editorEmail!,
      password: editorPassword!,
      redirectTo: '/dashboard/access'
    })

    await expect(page.getByText(/sem permissão|acesso negado/i)).toBeVisible()
  })

  test('viewer has read-only project list (no create button)', async ({ page }) => {
    await loginWithPassword(page, {
      email: viewerEmail!,
      password: viewerPassword!,
      redirectTo: '/dashboard/projects'
    })

    await expect(page.getByRole('button', { name: /novo projeto/i })).toHaveCount(0)
    await expect(page.getByText(/projetos ativos/i)).toBeVisible()
  })
})
