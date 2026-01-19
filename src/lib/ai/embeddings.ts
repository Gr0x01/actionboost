/**
 * Embeddings module for vector search over user context
 *
 * Uses OpenAI's text-embedding-3-small model (1536 dimensions)
 * Cost: ~$0.02 per 1M tokens (negligible - about $0.00002 per run)
 *
 * If OPENAI_API_KEY is not set, functions gracefully degrade:
 * - createEmbedding returns null
 * - extractAndEmbedRunContext skips embedding storage
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { RunInput } from './types'
import type { ChunkType, SourceType } from '@/lib/types/database'

// Only import OpenAI if we have the key (dynamic import for tree-shaking)
let openaiClient: any = null

async function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  if (!openaiClient) {
    try {
      const { default: OpenAI } = await import('openai')
      openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    } catch {
      console.warn('[Embeddings] OpenAI SDK not available')
      return null
    }
  }

  return openaiClient
}

/**
 * Create an embedding for a text string
 * Returns null if OpenAI is not configured
 */
export async function createEmbedding(text: string): Promise<number[] | null> {
  const client = await getOpenAIClient()
  if (!client) {
    return null
  }

  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    })
    return response.data[0].embedding
  } catch (err) {
    console.error('[Embeddings] Failed to create embedding:', err)
    return null
  }
}

/**
 * Create embeddings for multiple texts in parallel
 * Returns array of embeddings (null for any that failed)
 */
export async function createEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
  const client = await getOpenAIClient()
  if (!client) {
    return texts.map(() => null)
  }

  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: 1536,
    })
    return response.data.map((d: { embedding: number[] }) => d.embedding)
  } catch (err) {
    console.error('[Embeddings] Failed to create embeddings:', err)
    return texts.map(() => null)
  }
}

interface ChunkToEmbed {
  content: string
  chunkType: ChunkType
  sourceType: SourceType
  sourceId?: string
}

/**
 * Extract key facts from run input/output and store as embedded chunks
 * Gracefully skips if OpenAI is not configured
 */
export async function extractAndEmbedRunContext(
  runId: string,
  userId: string,
  input: RunInput,
  output: string
): Promise<void> {
  const chunks: ChunkToEmbed[] = []

  // Extract from input
  if (input.productDescription) {
    chunks.push({
      content: `Product: ${input.productDescription}`,
      chunkType: 'product',
      sourceType: 'run_input',
      sourceId: runId,
    })
  }

  if (input.currentTraction) {
    const date = new Date().toISOString().split('T')[0]
    chunks.push({
      content: `Traction (${date}): ${input.currentTraction}`,
      chunkType: 'traction',
      sourceType: 'run_input',
      sourceId: runId,
    })
  }

  if (input.whatYouTried) {
    chunks.push({
      content: `Tactics tried: ${input.whatYouTried}`,
      chunkType: 'tactic',
      sourceType: 'run_input',
      sourceId: runId,
    })
  }

  if (input.whatsWorking) {
    chunks.push({
      content: `What's working: ${input.whatsWorking}`,
      chunkType: 'tactic',
      sourceType: 'run_input',
      sourceId: runId,
    })
  }

  // Extract from output (parse markdown sections)
  const stopDoingSection = extractSection(output, 'Stop Doing')
  if (stopDoingSection) {
    chunks.push({
      content: `Advice to stop: ${stopDoingSection}`,
      chunkType: 'insight',
      sourceType: 'run_output',
      sourceId: runId,
    })
  }

  const startDoingSection = extractSection(output, 'Start Doing')
  if (startDoingSection) {
    chunks.push({
      content: `Recommendations: ${startDoingSection}`,
      chunkType: 'recommendation',
      sourceType: 'run_output',
      sourceId: runId,
    })
  }

  const quickWinsSection = extractSection(output, 'Quick Wins')
  if (quickWinsSection) {
    chunks.push({
      content: `Quick wins: ${quickWinsSection}`,
      chunkType: 'recommendation',
      sourceType: 'run_output',
      sourceId: runId,
    })
  }

  if (chunks.length === 0) {
    return
  }

  // Create embeddings for all chunks
  const embeddings = await createEmbeddings(chunks.map(c => c.content))

  // Store chunks in database
  const supabase = createServiceClient()

  const rows = chunks.map((chunk, i) => ({
    user_id: userId,
    content: chunk.content,
    chunk_type: chunk.chunkType,
    source_type: chunk.sourceType,
    source_id: chunk.sourceId,
    embedding: embeddings[i] ? `[${embeddings[i]!.join(',')}]` : null,
    metadata: {},
  }))

  const { error } = await supabase.from('user_context_chunks').insert(rows)

  if (error) {
    console.error('[Embeddings] Failed to store chunks:', error)
  } else {
    console.log(`[Embeddings] Stored ${rows.length} context chunks for user ${userId}`)
  }
}

/**
 * Search user's context chunks by semantic similarity
 */
export async function searchUserContext(
  userId: string,
  query: string,
  options?: {
    chunkTypes?: ChunkType[]
    limit?: number
  }
): Promise<Array<{
  content: string
  chunkType: ChunkType
  sourceType: SourceType
  sourceId: string | null
  similarity: number
  createdAt: string
}>> {
  const embedding = await createEmbedding(query)

  if (!embedding) {
    // Fallback to text search if embeddings not available
    return searchUserContextFallback(userId, query, options)
  }

  const supabase = createServiceClient()
  const limit = options?.limit ?? 5

  // Use pgvector similarity search
  // Note: This requires a function in Supabase, or we can do it via raw SQL
  const { data, error } = await supabase.rpc('match_user_context_chunks', {
    query_embedding: embedding,
    match_user_id: userId,
    match_threshold: 0.5,
    match_count: limit,
  })

  if (error) {
    console.error('[Embeddings] Vector search failed, falling back to text:', error)
    return searchUserContextFallback(userId, query, options)
  }

  return (data || []).map((row: any) => ({
    content: row.content,
    chunkType: row.chunk_type as ChunkType,
    sourceType: row.source_type as SourceType,
    sourceId: row.source_id,
    similarity: row.similarity,
    createdAt: row.created_at,
  }))
}

/**
 * Fallback text search when embeddings aren't available
 */
async function searchUserContextFallback(
  userId: string,
  query: string,
  options?: {
    chunkTypes?: ChunkType[]
    limit?: number
  }
): Promise<Array<{
  content: string
  chunkType: ChunkType
  sourceType: SourceType
  sourceId: string | null
  similarity: number
  createdAt: string
}>> {
  const supabase = createServiceClient()
  const limit = options?.limit ?? 5

  let queryBuilder = supabase
    .from('user_context_chunks')
    .select('*')
    .eq('user_id', userId)
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (options?.chunkTypes && options.chunkTypes.length > 0) {
    queryBuilder = queryBuilder.in('chunk_type', options.chunkTypes)
  }

  const { data, error } = await queryBuilder

  if (error) {
    console.error('[Embeddings] Fallback search failed:', error)
    return []
  }

  return (data || []).map((row) => ({
    content: row.content,
    chunkType: row.chunk_type as ChunkType,
    sourceType: row.source_type as SourceType,
    sourceId: row.source_id,
    similarity: 0.5, // Placeholder for text match
    createdAt: row.created_at || '',
  }))
}

/**
 * Extract a section from markdown output by header
 */
function extractSection(markdown: string, sectionName: string): string | null {
  // Look for ## Section Name or # Section Name
  const regex = new RegExp(`^#{1,3}\\s*${sectionName}[^\\n]*\\n([\\s\\S]*?)(?=^#{1,3}\\s|$)`, 'mi')
  const match = markdown.match(regex)

  if (!match || !match[1]) {
    return null
  }

  // Clean up the content - remove excess whitespace, limit length
  const content = match[1]
    .trim()
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 1000) // Limit to 1000 chars per section

  return content || null
}
