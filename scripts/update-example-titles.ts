/**
 * Update example titles/insights to be meaningful
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UPDATES = [
  {
    slug: 'saas-analytics-growth',
    insight: 'PixelMetrics: Standing out in the privacy analytics market',
  },
  {
    slug: 'ecommerce-retention-fix',
    insight: 'Brew & Bean: Why 60% of subscribers cancel in 3 months',
  },
]

async function main() {
  for (const update of UPDATES) {
    const { error } = await supabase
      .from('examples')
      .update({ insight: update.insight })
      .eq('slug', update.slug)

    if (error) {
      console.log(`❌ ${update.slug}: ${error.message}`)
    } else {
      console.log(`✓ ${update.slug}: "${update.insight}"`)
    }
  }
}

main()
