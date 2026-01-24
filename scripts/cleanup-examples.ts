/**
 * Remove old examples, keep only new target-audience-aligned ones
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Old examples to delete
const OLD_SLUGS = ['ecommerce-conversion-fix', 'salon-instagram-focus']

async function main() {
  console.log('Cleaning up old examples...\n')

  for (const slug of OLD_SLUGS) {
    const { error } = await supabase
      .from('examples')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.log(`❌ Failed to delete ${slug}: ${error.message}`)
    } else {
      console.log(`✓ Deleted ${slug}`)
    }
  }

  // List remaining
  const { data: remaining } = await supabase
    .from('examples')
    .select('slug, industry, stage, is_live')
    .order('created_at', { ascending: false })

  console.log('\nRemaining examples:')
  for (const ex of remaining || []) {
    console.log(`  - ${ex.slug} (${ex.industry}, ${ex.stage}) ${ex.is_live ? '✓ live' : '○ draft'}`)
  }
}

main()
