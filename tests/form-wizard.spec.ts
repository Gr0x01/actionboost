import { test, expect } from "@playwright/test"

test.describe("Form Wizard", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
  })

  test("navigates through multi-step form", async ({ page }) => {
    await page.goto("/start")

    // Step 1: Traction (required - chip selection)
    await expect(page.getByText("What traction do you have so far?")).toBeVisible()
    await page.getByText("Pre-launch").click() // Click a chip to proceed

    // Step 2: Focus area (required - single select)
    await expect(page.getByText("Where should we focus?")).toBeVisible()
    await page.getByText("Acquisition").click()

    // Step 3: Product description (required)
    await expect(page.getByText("Tell me about your business")).toBeVisible()
    await page.getByRole("textbox").fill("A SaaS tool for managing widgets")
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled()
    await page.getByRole("button", { name: /continue/i }).click()

    // Step 4: Alternatives (required - multi-select, needs Continue)
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

    // Should reach checkout
    await expect(page.getByText("Ready to")).toBeVisible()
  })

  test("back navigation works", async ({ page }) => {
    await page.goto("/start")

    // Step 1: Select traction
    await expect(page.getByText("What traction do you have so far?")).toBeVisible()
    await page.getByText("Pre-launch").click()

    // Step 2: Select focus
    await expect(page.getByText("Where should we focus?")).toBeVisible()
    await page.getByText("Acquisition").click()

    // Step 3: Fill product description
    await expect(page.getByText("Tell me about your business")).toBeVisible()
    await page.getByRole("textbox").fill("Test product")
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled()
    await page.getByRole("button", { name: /continue/i }).click()

    // Step 4: Go back from alternatives
    await expect(page.getByText("If they didn't use you")).toBeVisible()
    await page.getByRole("button", { name: /back/i }).click()

    // Should be back on step 3 with text preserved
    await expect(page.getByText("Tell me about your business")).toBeVisible()
    await expect(page.getByRole("textbox")).toHaveValue("Test product")
  })

  test("persists form data in localStorage", async ({ page }) => {
    await page.goto("/start")

    // Step 1: Select traction
    await expect(page.getByText("What traction do you have so far?")).toBeVisible()
    await page.getByText("Pre-launch").click()

    // Step 2: Select focus
    await expect(page.getByText("Where should we focus?")).toBeVisible()
    await page.getByText("Acquisition").click()

    // Step 3: Fill product description
    await expect(page.getByText("Tell me about your business")).toBeVisible()
    await page.getByRole("textbox").fill("Persisted product data")
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled()
    await page.getByRole("button", { name: /continue/i }).click()

    // Wait for localStorage to be saved (debounced at 500ms)
    await page.waitForTimeout(600)

    // Check localStorage was saved correctly
    const storage = await page.evaluate(() =>
      localStorage.getItem("actionboost-form-v4")
    )
    expect(storage).toBeTruthy()
    const parsed = JSON.parse(storage!)
    expect(parsed.productDescription).toBe("Persisted product data")
  })

  test("validates required fields", async ({ page }) => {
    await page.goto("/start")

    // Step 1: Traction - requires chip selection, no skip button
    await expect(page.getByText("What traction do you have so far?")).toBeVisible()

    // Verify there's no skip button for required field
    const skipButton = page.getByRole("button", { name: /skip/i })
    const isSkipVisible = await skipButton.isVisible().catch(() => false)
    expect(isSkipVisible).toBe(false)

    // Click a chip to proceed
    await page.getByText("Pre-launch").click()

    // Should advance to next question
    await expect(page.getByText("Where should we focus?")).toBeVisible()
  })

  test("handles URL prefill from hero", async ({ page }) => {
    // Simulate coming from hero with prefilled description
    await page.goto("/start?prefill=My%20awesome%20startup")

    // Should start at first question (traction)
    await expect(page.getByText("What traction do you have so far?")).toBeVisible()
  })
})
