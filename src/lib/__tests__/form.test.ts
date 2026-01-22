import { describe, it, expect } from "vitest"
import {
  validateForm,
  getTotalCharCount,
  INITIAL_FORM_STATE,
  MAX_TOTAL_CHARS,
  FormInput,
} from "../types/form"

describe("getTotalCharCount", () => {
  it("returns 0 for empty form", () => {
    expect(getTotalCharCount(INITIAL_FORM_STATE)).toBe(0)
  })

  it("counts all text fields", () => {
    const form: FormInput = {
      ...INITIAL_FORM_STATE,
      productDescription: "12345", // 5
      currentTraction: "123", // 3
      tacticsAndResults: "12", // 2
      competitors: ["a", "bb", "ccc"], // 6
      websiteUrl: "1234", // 4
      analyticsSummary: "12345678", // 8
      constraints: "1", // 1
    }
    expect(getTotalCharCount(form)).toBe(29)
  })

  it("handles empty competitors array elements", () => {
    const form: FormInput = {
      ...INITIAL_FORM_STATE,
      productDescription: "test",
      competitors: ["", "", ""],
    }
    expect(getTotalCharCount(form)).toBe(4) // Only productDescription
  })
})

describe("validateForm", () => {
  const validForm: FormInput = {
    ...INITIAL_FORM_STATE,
    productDescription: "A SaaS product for managing widgets",
    currentTraction: "100 users, $1k MRR",
    tacticsAndResults: "Tried content marketing, mixed results",
  }

  it("passes validation for complete form", () => {
    const errors = validateForm(validForm)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it("requires productDescription", () => {
    const form = { ...validForm, productDescription: "" }
    const errors = validateForm(form)
    expect(errors.productDescription).toBeDefined()
  })

  it("requires currentTraction", () => {
    const form = { ...validForm, currentTraction: "" }
    const errors = validateForm(form)
    expect(errors.currentTraction).toBeDefined()
  })

  it("requires tacticsAndResults for new users", () => {
    const form = { ...validForm, tacticsAndResults: "" }
    const errors = validateForm(form, false) // isReturningUser = false
    expect(errors.tacticsAndResults).toBeDefined()
  })

  it("does not require tacticsAndResults for returning users", () => {
    const form = { ...validForm, tacticsAndResults: "" }
    const errors = validateForm(form, true) // isReturningUser = true
    expect(errors.tacticsAndResults).toBeUndefined()
  })

  it("rejects whitespace-only fields", () => {
    const form = {
      ...validForm,
      productDescription: "   ",
      currentTraction: "\t\n",
    }
    const errors = validateForm(form)
    expect(errors.productDescription).toBeDefined()
    expect(errors.currentTraction).toBeDefined()
  })

  it("rejects content exceeding MAX_TOTAL_CHARS", () => {
    const longString = "x".repeat(MAX_TOTAL_CHARS + 1)
    const form = { ...validForm, productDescription: longString }
    const errors = validateForm(form)
    expect(errors.total).toBeDefined()
    expect(errors.total).toContain(MAX_TOTAL_CHARS.toLocaleString())
  })

  it("allows content exactly at MAX_TOTAL_CHARS", () => {
    // Calculate how much padding we need
    const baseLength =
      validForm.currentTraction.length + validForm.tacticsAndResults.length
    const remaining = MAX_TOTAL_CHARS - baseLength
    const form = {
      ...validForm,
      productDescription: "x".repeat(remaining),
    }
    const errors = validateForm(form)
    expect(errors.total).toBeUndefined()
  })

  describe("edge cases and security", () => {
    it("handles very long individual field", () => {
      const form = {
        ...validForm,
        productDescription: "x".repeat(MAX_TOTAL_CHARS + 100),
      }
      const errors = validateForm(form)
      expect(errors.total).toBeDefined()
    })

    it("handles unicode characters in content", () => {
      const form = {
        ...validForm,
        productDescription: "A product with émojis 🚀 and ünïcödé",
      }
      const errors = validateForm(form)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it("handles special HTML characters (potential XSS)", () => {
      const form = {
        ...validForm,
        productDescription: '<script>alert("xss")</script>',
      }
      // Form validation should pass - XSS prevention is at render time
      const errors = validateForm(form)
      expect(errors.productDescription).toBeUndefined()
    })

    it("handles SQL injection patterns in text", () => {
      const form = {
        ...validForm,
        productDescription: "'; DROP TABLE users; --",
      }
      // Form validation should pass - SQL injection prevention is at DB layer
      const errors = validateForm(form)
      expect(errors.productDescription).toBeUndefined()
    })

    it("handles newlines and tabs in content", () => {
      const form = {
        ...validForm,
        productDescription: "Line 1\nLine 2\tTabbed",
      }
      const errors = validateForm(form)
      expect(Object.keys(errors)).toHaveLength(0)
    })

    it("counts all text fields for total limit", () => {
      // Explicitly exceed the limit by filling multiple fields
      const halfLimit = Math.floor(MAX_TOTAL_CHARS / 2) + 1000
      const form: FormInput = {
        ...INITIAL_FORM_STATE,
        productDescription: "x".repeat(halfLimit),
        currentTraction: "x".repeat(halfLimit),
        tacticsAndResults: "valid content",
      }
      // Verify we're actually over the limit
      const totalChars = getTotalCharCount(form)
      expect(totalChars).toBeGreaterThan(MAX_TOTAL_CHARS)

      const errors = validateForm(form)
      expect(errors.total).toBeDefined()
    })
  })
})
