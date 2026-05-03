import { expect, test } from '@playwright/test'
import { loginWithPassword } from './helpers/auth'

const viewerEmail = process.env.PLAYWRIGHT_VIEWER_EMAIL
const viewerPassword = process.env.PLAYWRIGHT_VIEWER_PASSWORD

const shouldSeed = process.env.PLAYWRIGHT_SEED === 'true'
const canRunAuthE2E = Boolean(viewerEmail && viewerPassword)

test.describe('dashboard theme and profile UX', () => {
  test.skip(!canRunAuthE2E, 'requires PLAYWRIGHT_VIEWER_EMAIL and PLAYWRIGHT_VIEWER_PASSWORD')

  test('theme toggle persists manual override', async ({ page, context }) => {
    await loginWithPassword(page, {
      email: viewerEmail!,
      password: viewerPassword!,
      redirectTo: '/dashboard'
    })

    const root = page.locator('html')
    const toggle = page.getByRole('button', { name: /ativar tema/i })

    await expect(root).toHaveAttribute('data-theme', /light|dark/)
    const before = await root.getAttribute('data-theme')

    await toggle.click()
    const after = await root.getAttribute('data-theme')
    expect(after).not.toBe(before)

    await page.reload()
    await expect(root).toHaveAttribute('data-theme', String(after))

    const storage = await context.storageState()
    const localStore = storage.origins
      .flatMap((origin) => origin.localStorage)
      .find((entry) => entry.name === 'theme.override')
    expect(localStore?.value).toBe(after)
  })

  test.skip(!shouldSeed, 'requires PLAYWRIGHT_SEED=true and Supabase envs')
  test('avatar upload updates topbar image', async ({ page }) => {
    await loginWithPassword(page, {
      email: viewerEmail!,
      password: viewerPassword!,
      redirectTo: '/dashboard'
    })

    const avatarInput = page.locator('input[type="file"][accept*="image/png"]')
    await avatarInput.setInputFiles({
      name: 'avatar-e2e.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgI4H4qUAAAAASUVORK5CYII=',
        'base64'
      )
    })

    await expect(page.locator('header img[alt="Avatar"]').first()).toBeVisible({ timeout: 30_000 })
  })
})
