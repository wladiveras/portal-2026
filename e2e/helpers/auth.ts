import { expect, type Page } from '@playwright/test'

interface LoginPayload {
  email: string
  password: string
  redirectTo?: string
}

export async function loginWithPassword(page: Page, payload: LoginPayload): Promise<void> {
  const redirect = payload.redirectTo ?? '/dashboard'
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}&mode=password`)

  const passwordInput = page.locator('#login-password')
  const passwordSubmitButton = page.getByRole('button', { name: 'Entrar', exact: true })
  await expect(passwordInput).toBeVisible()
  await expect(passwordSubmitButton).toBeVisible()

  await page.locator('#login-email').fill(payload.email)
  await passwordInput.fill(payload.password)
  await passwordSubmitButton.click()

  await expect(page).toHaveURL(new RegExp(redirect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
}
