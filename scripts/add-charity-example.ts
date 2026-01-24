/**
 * Add the Charity Donation App example to the database
 * Run with: npx tsx scripts/add-charity-example.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Read the markdown content
  const contentPath = join(__dirname, '../docs/examples/charity-donation-app.md')
  const content = readFileSync(contentPath, 'utf-8')

  const example = {
    slug: 'charity-donation-app',
    industry: 'Nonprofit / Charity Tech',
    stage: 'Pre-launch',
    insight: "You don't need to choose between newsletter and app — you need newsletter first, then website, then app. Each stage de-risks the next. The Apple approval problem disappears when you have 1,000 donors asking for the app.",
    content,
    is_live: false, // Draft by default, set to true when ready to publish
  }

  console.log('Adding example to database...')
  console.log(`  Slug: ${example.slug}`)
  console.log(`  Industry: ${example.industry}`)
  console.log(`  Stage: ${example.stage}`)

  const { data, error } = await supabase
    .from('examples')
    .upsert(example, { onConflict: 'slug' })
    .select()
    .single()

  if (error) {
    console.error('Failed to add example:', error)
    process.exit(1)
  }

  console.log('\nExample added successfully!')
  console.log(`  ID: ${data.id}`)
  console.log(`  Status: ${data.is_live ? 'LIVE' : 'DRAFT'}`)
  console.log(`\nTo publish, run:`)
  console.log(`  npx tsx -e "require('dotenv').config({path:'.env.local'});require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY).from('examples').update({is_live:true,published_at:new Date().toISOString()}).eq('slug','charity-donation-app').then(console.log)"`)
  console.log(`\nTo extract structured output for dashboard view:`)
  console.log(`  npx tsx scripts/extract-examples.ts`)
}

main()
