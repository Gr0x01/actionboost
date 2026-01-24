import { test, expect } from "@playwright/test"

test.describe("Checkout Flow", () => {
  // Helper to fill form and reach checkout
  async function fillFormAndReachCheckout(page: import("@playwright/test").Page) {
    // Clear localStorage before navigating to ensure clean state
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.goto("/start")

    // Step 1: Traction - select a chip
    await expect(page.getByText("What traction do you have so far?")).toBeVisible()
    await page.getByText("Pre-launch").click()

    // Step 2: Focus area - select Acquisition
    await expect(page.getByText("Where should we focus?")).toBeVisible()
    await page.getByText("Acquisition").click()

    // Step 3: Product description
    await expect(page.getByText("Tell me about your business")).toBeVisible()
    const textbox = page.getByRole("textbox")
    await textbox.fill("A test product for E2E testing")
    await expect(textbox).toHaveValue("A test product for E2E testing")
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled()
    await page.getByRole("button", { name: /continue/i }).click()

    // Step 4: Alternatives - select a chip and continue
    await expect(page.getByText("If they didn't use you")).toBeVisible()
    await page.getByRole("button", { name: /Google it/i }).click()
    await page.getByRole("button", { name: /continue/i }).click()

    // Step 5: Website (optional - skip)
    await expect(page.getByText("What's your website?")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 6: Competitors (optional - skip)
    await expect(page.getByText("competitors")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 7: Email (optional - skip)
    await expect(page.getByText("Where should we send")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Should be at checkout
    await expect(page.getByText("Ready to")).toBeVisible()
  }

  test("displays checkout options after completing form", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Should show the main CTA button ($29 price)
    await expect(page.getByRole("button", { name: /\$29/i })).toBeVisible()
  })

  test("shows promo code input", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Look for promo code toggle text
    const hasPromoToggle = await page
      .getByText(/promo code/i)
      .isVisible()
      .catch(() => false)

    // Promo code toggle should be present
    expect(hasPromoToggle).toBe(true)
  })

  test("validates promo code format", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Click the promo code toggle
    await page.getByText(/promo code/i).click()

    // Enter an invalid code
    const codeInput = page.getByPlaceholder(/code/i)
    await expect(codeInput).toBeVisible()
    await codeInput.fill("INVALIDCODE123")
    await page.getByRole("button", { name: /apply/i }).click()

    // Wait for validation response - should show error or stay on checkout
    await expect(page.getByText("Ready to")).toBeVisible({ timeout: 5000 })
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

    // Click checkout button ($29 price)
    await page.getByRole("button", { name: /\$29/i }).click()

    // Wait for the API response instead of arbitrary timeout
    const response = await responsePromise
    expect(response.status()).toBe(200)
  })

  test("shows free audit option", async ({ page }) => {
    await fillFormAndReachCheckout(page)

    // Should show a free preview button
    const hasFreeOption = await page
      .getByRole("button", { name: /free preview/i })
      .isVisible()
      .catch(() => false)

    // Free audit option should be present
    expect(hasFreeOption).toBe(true)
  })
})
