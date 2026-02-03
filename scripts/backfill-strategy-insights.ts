/**
 * One-off backfill: Re-generate strategy context with insights for a subscription.
 *
 * Usage: npx tsx scripts/backfill-strategy-insights.ts
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { generateStrategyContext } from '../src/lib/ai/pipeline-strategy'
import type { BusinessProfile } from '../src/lib/types/business-profile'
import type { Json } from '../src/lib/types/database'

const SUBSCRIPTION_ID = '52069dcf-b3c4-45a6-b88d-7d31abd207be'
const BUSINESS_ID = '80fcf1d4-0839-49ce-b051-63360b88ba71'
const USER_ID = '5d959875-72b5-4bda-af72-1fe1a479c008'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Fetch business profile
  const { data: business } = await supabase
    .from('businesses')
    .select('context')
    .eq('id', BUSINESS_ID)
    .single()

  if (!business) {
    console.error('Business not found')
    process.exit(1)
  }

  const context = (business.context as Record<string, unknown>) || {}
  // Business context may store under 'profile' or 'product' key
  const profile = (context.profile as BusinessProfile) || (context.product as BusinessProfile) || {}

  console.log('Profile:', profile.description?.slice(0, 80))
  console.log('Generating strategy with Opus (this takes 1-3 min)...')

  const { strategyContext, researchData, insights } = await generateStrategyContext({
    profile,
    monthNumber: 1,
    userId: USER_ID,
    businessId: BUSINESS_ID,
    onStageUpdate: async (stage) => console.log(`  [${stage}]`),
  })

  console.log('Strategy generated. Quarter focus:', strategyContext.quarterFocus.primaryObjective)
  console.log('Has insights:', !!insights)
  console.log('Has researchData:', !!researchData)

  // Store enriched strategy context
  const enrichedStrategy = {
    ...strategyContext,
    ...(insights ? { insights } : {}),
    ...(researchData ? { researchData } : {}),
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({ strategy_context: enrichedStrategy as unknown as Json })
    .eq('id', SUBSCRIPTION_ID)

  if (error) {
    console.error('Failed to store:', error.message)
    process.exit(1)
  }

  console.log('Done! Strategy context with insights stored on subscription.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
