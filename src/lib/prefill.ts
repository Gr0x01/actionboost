/**
 * Write prefill data to localStorage so /start picks it up.
 * Uses the same key + format that useFormPrefill already reads.
 */
const PREFILL_KEY = 'actionboost-prefill'

export function prefillStartForm(data: {
  websiteUrl?: string
  productDescription?: string
}) {
  if (!data.websiteUrl && !data.productDescription) return

  localStorage.setItem(
    PREFILL_KEY,
    JSON.stringify({
      websiteUrl: data.websiteUrl || '',
      metadata: {
        title: null,
        description: data.productDescription || null,
        favicon: null,
        siteName: null,
      },
      timestamp: Date.now(),
    })
  )
}
