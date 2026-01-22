import { describe, it, expect } from "vitest"
import { signAuditToken, verifyAuditToken } from "../auth/audit-token"

/**
 * Audit Token Security Notes:
 *
 * The implementation uses crypto.timingSafeEqual() to prevent timing attacks.
 * Timing attacks work by measuring how long comparison takes - if a naive
 * string comparison exits early on first mismatch, attackers can guess
 * tokens character by character.
 *
 * timingSafeEqual() always takes the same time regardless of where
 * the mismatch occurs, preventing this attack vector.
 *
 * Testing timing-safety directly is impractical in unit tests due to
 * system noise, but this is verified by code review.
 */

describe("audit token", () => {
  it("signs and verifies valid token", () => {
    const auditId = "test-audit-123"
    const token = signAuditToken(auditId)
    expect(verifyAuditToken(auditId, token)).toBe(true)
  })

  it("generates consistent tokens for same input", () => {
    const auditId = "consistent-test"
    const token1 = signAuditToken(auditId)
    const token2 = signAuditToken(auditId)
    expect(token1).toBe(token2)
  })

  it("generates different tokens for different inputs", () => {
    const token1 = signAuditToken("audit-1")
    const token2 = signAuditToken("audit-2")
    expect(token1).not.toBe(token2)
  })

  it("rejects tampered token", () => {
    const auditId = "test-audit-123"
    const token = signAuditToken(auditId)
    const tampered = token.slice(0, -5) + "xxxxx"
    expect(verifyAuditToken(auditId, tampered)).toBe(false)
  })

  it("rejects mismatched audit ID", () => {
    const token = signAuditToken("audit-1")
    expect(verifyAuditToken("audit-2", token)).toBe(false)
  })

  it("rejects empty inputs", () => {
    expect(verifyAuditToken("", "token")).toBe(false)
    expect(verifyAuditToken("id", "")).toBe(false)
    expect(verifyAuditToken("", "")).toBe(false)
  })

  it("rejects malformed tokens", () => {
    expect(verifyAuditToken("test", "no-dot-here")).toBe(false)
    expect(verifyAuditToken("test", ".")).toBe(false)
    expect(verifyAuditToken("test", "..")).toBe(false)
  })

  it("handles special characters in audit ID", () => {
    const auditId = "audit-with-special-chars-!@#$%"
    const token = signAuditToken(auditId)
    expect(verifyAuditToken(auditId, token)).toBe(true)
  })

  it("handles UUID-style audit IDs", () => {
    const auditId = "550e8400-e29b-41d4-a716-446655440000"
    const token = signAuditToken(auditId)
    expect(verifyAuditToken(auditId, token)).toBe(true)
  })
})
