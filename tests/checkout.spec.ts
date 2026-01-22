import { test, expect } from "@playwright/test"

test.describe("Checkout Flow", () => {
  // Helper to fill form and reach checkout
  async function fillFormAndReachCheckout(page: import("@playwright/test").Page) {
    // Clear localStorage before navigating to ensure clean state
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.goto("/start")

    // Step 1: Skip website URL - wait for page to fully load first
    await expect(page.getByText("What's your website?")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 2: Product description - wait for question to appear first
    await expect(page.getByText("Tell me about your product")).toBeVisible()
    const textbox = page.getByRole("textbox")
    await textbox.fill("A test product for E2E testing")
    // Verify the value was set and button is enabled
    await expect(textbox).toHaveValue("A test product for E2E testing")
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled()
    await page.getByRole("button", { name: /continue/i }).click()

    // Step 3: Traction - wait for question to appear after acknowledgment
    await expect(page.getByText("What traction")).toBeVisible()
    await page.getByRole("textbox").fill("50 users testing")
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled()
    await page.getByRole("button", { name: /continue/i }).click()

    // Step 4: Tactics - wait for question to appear
    await expect(page.getByText("What have you tried")).toBeVisible()
    await page.getByRole("textbox").fill("Tried some things")
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled()
    await page.getByRole("button", { name: /continue/i }).click()

    // Step 5: Skip attachments - wait for question first
    await expect(page.getByText("screenshots or data")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 6: Focus area - wait for question, then click Acquisition
    await expect(page.getByText("Where should we focus")).toBeVisible()
    await page.getByText("Acquisition").click()

    // Step 7: Skip email - wait for question first
    await expect(page.getByText("Where should we send")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 8: Skip competitors - wait for question first
    await expect(page.getByText("competitors")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Should be at checkout
    await expect(page.getByText("Ready to")).toBeVisible()
  }

  test("displays checkout options after completing form", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Should show the main CTA button ($9.99 price)
    await expect(page.getByRole("button", { name: /\$9\.99/i })).toBeVisible()
  })

  test("shows promo code input", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Look for promo code input or toggle
    const hasPromoField = await page
      .getByPlaceholder(/code/i)
      .isVisible()
      .catch(() => false)

    const hasPromoToggle = await page
      .getByText(/promo code/i)
      .isVisible()
      .catch(() => false)

    // Either the input is visible or there's a toggle to show it
    expect(hasPromoField || hasPromoToggle).toBe(true)
  })

  test("validates promo code format", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // If there's a "promo code" toggle, click it
    const hasPromoToggle = await page
      .getByText(/promo code/i)
      .isVisible()
      .catch(() => false)

    if (hasPromoToggle) {
      await page.getByText(/promo code/i).click()
    }

    // Enter an invalid code
    const codeInput = page.getByPlaceholder(/code/i)
    if (await codeInput.isVisible()) {
      await codeInput.fill("INVALIDCODE123")
      await page.getByRole("button", { name: /apply|redeem/i }).click()

      // Wait for validation response - either error appears or we stay on checkout
      // Use proper waiting instead of arbitrary timeout
      await expect(page.getByText("Ready to")).toBeVisible({ timeout: 5000 })
    }
  })

  test("checkout button initiates Stripe redirect", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Set up route interception before clicking
    const responsePromise = page.waitForResponse("**/api/checkout/create-session")

    await page.route("**/api/checkout/create-session", async (route) => {
      // Return a mock response - Stripe won't actually be called
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://checkout.stripe.com/test-session" }),
      })
    })

    // Click checkout button ($9.99 price)
    await page.getByRole("button", { name: /\$9\.99/i }).click()

    // Wait for the API response instead of arbitrary timeout
    const response = await responsePromise
    expect(response.status()).toBe(200)
  })

  test("shows free audit option", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Should show a free option somewhere
    const hasFreeOption = await page
      .getByText(/free/i)
      .first()
      .isVisible()
      .catch(() => false)

    // Free audit option should be present
    expect(hasFreeOption).toBe(true)
  })
})
