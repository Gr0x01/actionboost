import { test, expect } from "@playwright/test"

test.describe("Form Wizard", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
  })

  test("navigates through multi-step form", async ({ page }) => {
    await page.goto("/start")

    // Step 1: Website URL (optional - skip it)
    await expect(page.getByText("What's your website?")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 2: Product description (required)
    await expect(
      page.getByText("Tell me about your product")
    ).toBeVisible()
    await page.getByRole("textbox").fill("A SaaS tool for managing widgets")
    await page.getByRole("button", { name: /next/i }).click()

    // Step 3: Traction
    await expect(page.getByText("What traction do you have")).toBeVisible()
    await page.getByRole("textbox").fill("100 users, $500 MRR")
    await page.getByRole("button", { name: /next/i }).click()

    // Step 4: Tactics tried
    await expect(page.getByText("What have you tried")).toBeVisible()
    await page.getByRole("textbox").fill("Content marketing, some paid ads")
    await page.getByRole("button", { name: /next/i }).click()

    // Step 5: Attachments (optional - skip)
    await expect(page.getByText("screenshots or data")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 6: Focus area
    await expect(page.getByText("Where should we focus")).toBeVisible()
    await page.getByText("Acquisition").click()

    // Step 7: Email (optional - skip)
    await expect(page.getByText("Where should we send")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Step 8: Competitors (optional - skip)
    await expect(page.getByText("competitors")).toBeVisible()
    await page.getByRole("button", { name: /skip/i }).click()

    // Should reach checkout
    await expect(page.getByText("Get Strategy")).toBeVisible()
  })

  test("back navigation works", async ({ page }) => {
    await page.goto("/start")

    // Skip first question
    await page.getByRole("button", { name: /skip/i }).click()

    // On step 2, fill in something
    await expect(
      page.getByText("Tell me about your product")
    ).toBeVisible()
    await page.getByRole("textbox").fill("Test product")
    await page.getByRole("button", { name: /next/i }).click()

    // On step 3, go back
    await expect(page.getByText("What traction")).toBeVisible()
    await page.getByRole("button", { name: /back/i }).click()

    // Should be back on step 2 with text preserved
    await expect(
      page.getByText("Tell me about your product")
    ).toBeVisible()
    await expect(page.getByRole("textbox")).toHaveValue("Test product")
  })

  test("persists form data in localStorage", async ({ page }) => {
    await page.goto("/start")

    // Skip to product description and fill it
    await page.getByRole("button", { name: /skip/i }).click()
    await page.getByRole("textbox").fill("Persisted product data")
    await page.getByRole("button", { name: /next/i }).click()

    // Reload page
    await page.reload()

    // Data should be restored from localStorage
    // Check by going back or checking storage
    const storage = await page.evaluate(() =>
      localStorage.getItem("actionboost-form-v3")
    )
    expect(storage).toBeTruthy()
    const parsed = JSON.parse(storage!)
    expect(parsed.productDescription).toBe("Persisted product data")
  })

  test("validates required fields", async ({ page }) => {
    await page.goto("/start")

    // Skip to product description (required field)
    await page.getByRole("button", { name: /skip/i }).click()

    // Try to proceed with empty required field
    await expect(
      page.getByText("Tell me about your product")
    ).toBeVisible()

    // The Next button should be disabled or clicking it should not advance
    const nextButton = page.getByRole("button", { name: /next/i })

    // Either button is disabled or clicking doesn't advance
    const isDisabled = await nextButton.isDisabled().catch(() => false)

    if (!isDisabled) {
      // Click and verify we don't advance
      await nextButton.click()
      // Should still be on the same question
      await expect(
        page.getByText("Tell me about your product")
      ).toBeVisible()
    }
  })

  test("handles URL prefill from hero", async ({ page }) => {
    // Simulate coming from hero with prefilled description
    await page.goto("/start?prefill=My%20awesome%20startup")

    // Should start at first question (website)
    await expect(page.getByText("What's your website?")).toBeVisible()
  })
})
