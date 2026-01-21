'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface CodeStatus {
  valid: boolean
  credits?: number
  error?: string
}

interface UsePromoCodeResult {
  promoCode: string
  setPromoCode: (code: string) => void
  codeStatus: CodeStatus | null
  isValidatingCode: boolean
  validateCode: () => Promise<void>
  clearCode: () => void
  hasValidCode: boolean
}

/**
 * Hook to manage promo code validation state
 */
export function usePromoCode(): UsePromoCodeResult {
  const [promoCode, setPromoCode] = useState('')
  const [codeStatus, setCodeStatus] = useState<CodeStatus | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const isInitialMount = useRef(true)

  // Clear codeStatus when promoCode changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setCodeStatus(null)
  }, [promoCode])

  const validateCode = useCallback(async () => {
    if (!promoCode.trim()) return
    setIsValidatingCode(true)
    setCodeStatus(null)

    try {
      const res = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })
      const data = await res.json()
      setCodeStatus(data)
    } catch {
      setCodeStatus({ valid: false, error: 'Failed to validate' })
    } finally {
      setIsValidatingCode(false)
    }
  }, [promoCode])

  const clearCode = useCallback(() => {
    setPromoCode('')
    setCodeStatus(null)
  }, [])

  const hasValidCode = codeStatus?.valid === true

  return {
    promoCode,
    setPromoCode,
    codeStatus,
    isValidatingCode,
    validateCode,
    clearCode,
    hasValidCode,
  }
}
