import { expect, test } from '@playwright/test'
import { landing } from '../app/data/landing'

test.describe('landing', () => {
  test('loading completes and core sections exist', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#home')).toBeVisible({ timeout: 90_000 })
    await expect(page.locator('#work')).toBeAttached()
    await expect(page.locator('#contact-cta')).toBeAttached()
  })

  test('FloatingNav opens and navigates to #work and #contact-cta', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#home')).toBeVisible({ timeout: 90_000 })

    await page.getByRole('button', { name: /Abrir menu/i }).click()
    await page.getByRole('link', { name: 'Projetos', exact: true }).click()
    await expect(page).toHaveURL(/#work$/)

    await page.getByRole('button', { name: /Abrir menu/i }).click()
    await page.getByRole('link', { name: 'Fale comigo', exact: true }).click()
    await expect(page).toHaveURL(/#contact-cta$/)
  })

  test('WhatsApp CTA href matches landing SSOT', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#home')).toBeVisible({ timeout: 90_000 })
    const wa = page.getByRole('link', { name: landing.contact.ctaButtonLabel })
    await expect(wa).toBeVisible()
    await expect(wa).toHaveAttribute('href', landing.contact.whatsappHref)
  })
})
