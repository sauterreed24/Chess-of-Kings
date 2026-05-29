import { test, expect } from '@playwright/test'

test('title → chapter → advance opens the lab simulation', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#btn-enter-archive')).toBeVisible({ timeout: 15_000 })
  await page.locator('#btn-enter-archive').click()
  await page.locator('.chapter-btn').first().click()
  await expect(page.locator('#lab-overlay')).toHaveClass(/lab-overlay--active/)
  await page.locator('#btn-next').click()
  await expect(page.locator('#narrative-body')).not.toBeEmpty()
})

test('duel archive lists rivals after entering the archive', async ({ page }) => {
  await page.goto('./')
  await page.locator('#btn-enter-archive').click({ timeout: 15_000 })
  await page.locator('#btn-duel').click()
  await expect(page.locator('.duel-row').first()).toBeVisible()
  await page.locator('.duel-row').first().click()
  await expect(page.locator('#duel-panel .duel-launch')).toBeVisible()
})
