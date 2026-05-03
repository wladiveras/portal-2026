import { expect, test } from '@playwright/test'
import { loginWithPassword } from './helpers/auth'

const editorEmail = process.env.PLAYWRIGHT_EDITOR_EMAIL
const editorPassword = process.env.PLAYWRIGHT_EDITOR_PASSWORD
const viewerEmail = process.env.PLAYWRIGHT_VIEWER_EMAIL
const viewerPassword = process.env.PLAYWRIGHT_VIEWER_PASSWORD
const canRun = Boolean(
  editorEmail && editorPassword && viewerEmail && viewerPassword
)

test.describe('dashboard projects CRUD & RBAC', () => {
  test.skip(!canRun, 'requires PLAYWRIGHT_* email/password envs')

  test('editor opens seeded project and sees kanban', async ({ page }) => {
    await loginWithPassword(page, {
      email: editorEmail!,
      password: editorPassword!,
      redirectTo: '/dashboard/projects'
    })

    const firstCard = page.locator('article.glass-surface').first().getByRole('link', { name: /abrir projeto/i })
    await expect(firstCard).toBeVisible({ timeout: 30_000 })
    await firstCard.click()

    await expect(page.getByRole('navigation').filter({ hasText: /kanban/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nova task/i })).toBeVisible()
    await expect(page.locator('section.grid').first()).toBeVisible()
  })

  test('viewer sees project detail read-only (no nova task)', async ({ page }) => {
    await loginWithPassword(page, {
      email: viewerEmail!,
      password: viewerPassword!,
      redirectTo: '/dashboard/projects'
    })

    await page.locator('article.glass-surface').first().getByRole('link', { name: /abrir projeto/i }).click()

    await expect(page.getByRole('button', { name: /nova task/i })).toHaveCount(0)
    await expect(page.locator('section.grid').first()).toBeVisible()
  })
})
