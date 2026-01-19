import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { searchUserContext } from '@/lib/ai/embeddings'
import type { ChunkType } from '@/lib/types/database'

interface SearchRequest {
  query: string
  chunkTypes?: ChunkType[]
  limit?: number
}

/**
 * POST /api/user/context/search
 * Semantic search over user's context history
 */
export async function POST(request: Request): Promise<NextResponse> {
  const sessionUser = await getSessionUser()

  if (!sessionUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!sessionUser.publicUserId) {
    return NextResponse.json({ error: 'No user profile yet' }, { status: 400 })
  }

  let body: SearchRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.query || typeof body.query !== 'string') {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  const results = await searchUserContext(sessionUser.publicUserId, body.query, {
    chunkTypes: body.chunkTypes,
    limit: body.limit,
  })

  return NextResponse.json({
    results: results.map((r) => ({
      content: r.content,
      source: {
        type: r.sourceType,
        runId: r.sourceId,
        date: r.createdAt,
      },
      similarity: r.similarity,
    })),
  })
}
