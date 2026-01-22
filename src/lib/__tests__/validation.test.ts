import { describe, it, expect } from "vitest"
import { isValidEmail } from "../validation"

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true)
    expect(isValidEmail("user.name@domain.co.uk")).toBe(true)
    expect(isValidEmail("user+tag@example.com")).toBe(true)
    expect(isValidEmail("test123@sub.domain.org")).toBe(true)
  })

  it("trims and lowercases input", () => {
    expect(isValidEmail("  TEST@EXAMPLE.COM  ")).toBe(true)
    expect(isValidEmail("User@Domain.Com")).toBe(true)
  })

  it("rejects empty or invalid format", () => {
    expect(isValidEmail("")).toBe(false)
    expect(isValidEmail("   ")).toBe(false)
    expect(isValidEmail("notanemail")).toBe(false)
    expect(isValidEmail("@example.com")).toBe(false)
    expect(isValidEmail("test@")).toBe(false)
    expect(isValidEmail("test@.com")).toBe(false)
  })

  it("rejects consecutive dots", () => {
    expect(isValidEmail("test..user@example.com")).toBe(false)
    expect(isValidEmail("test@example..com")).toBe(false)
  })

  it("rejects leading/trailing dots in domain", () => {
    expect(isValidEmail("test@.example.com")).toBe(false)
    expect(isValidEmail("test@example.com.")).toBe(false)
  })

  it("rejects leading/trailing dots in local part", () => {
    expect(isValidEmail(".test@example.com")).toBe(false)
    expect(isValidEmail("test.@example.com")).toBe(false)
  })

  it("rejects emails with spaces", () => {
    expect(isValidEmail("test user@example.com")).toBe(false)
    expect(isValidEmail("test@exam ple.com")).toBe(false)
  })
})
