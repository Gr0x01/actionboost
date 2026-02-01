import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { INDUSTRY_SLUGS } from '@/lib/constants/industry-pages'

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
      url: `${BASE_URL}/in-action`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/marketing-plan-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/boost-vs-alternatives`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/boost-vs-alternatives/chatgpt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/boost-vs-alternatives/diy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/boost-vs-alternatives/agency`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/boost-vs-alternatives/enji`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/marketing-audit`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/target-audience-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/headline-analyzer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/email-subject-scorer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/competitor-finder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
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

  const supabase = await createClient()

  // Fetch public shared results
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

  // Fetch live examples from in-action
  const { data: examples } = await supabase
    .from('examples')
    .select('slug, published_at')
    .eq('is_live', true)
    .order('published_at', { ascending: false })
    .limit(50)

  const examplePages: MetadataRoute.Sitemap = (examples ?? []).map((example) => ({
    url: `${BASE_URL}/in-action/${example.slug}`,
    lastModified: example.published_at ? new Date(example.published_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Industry marketing plan pages
  const industryPages: MetadataRoute.Sitemap = INDUSTRY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/marketing-plan/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...industryPages, ...examplePages, ...sharedPages]
}
