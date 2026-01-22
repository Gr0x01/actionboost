import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://aboo.st'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/start`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/results/demo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch public shared results
  const supabase = await createClient()
  const { data: sharedRuns } = await supabase
    .from('runs')
    .select('share_slug, completed_at')
    .not('share_slug', 'is', null)
    .eq('status', 'complete')
    .order('completed_at', { ascending: false })
    .limit(100)

  const sharedPages: MetadataRoute.Sitemap = (sharedRuns ?? []).map((run) => ({
    url: `${BASE_URL}/share/${run.share_slug}`,
    lastModified: run.completed_at ? new Date(run.completed_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...sharedPages]
}
