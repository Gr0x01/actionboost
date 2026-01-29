# RAG Implementation Details (Archived)

Moved from `decisions.md` on Jan 29, 2026. Core architecture is in `architecture.md`.

---

## RAG: User Context in JSONB + Vector Chunks

Store accumulated user context in two places:
1. `users.context` JSONB - Structured data for form pre-fill and quick access
2. `user_context_chunks` - Vector embeddings for semantic search

Alternative rejected: Separate tables for each context type (4+ tables for minimal benefit).

---

## Embeddings: OpenAI text-embedding-3-small

1536 dimensions, $0.02/1M tokens (~$0.00002 per run). Well-supported by pgvector. Graceful degradation if OPENAI_API_KEY missing.

Alternative rejected: Claude embeddings (no native offering), local models (deployment complexity).

---

## Context Accumulation: Fire-and-Forget

After run completes, embedding extraction runs async. User sees results immediately. If embedding fails, text search fallback exists.

---

## RAG Retrieval: Hybrid Approach

Retrieve via both structured context (JSONB) and vector search:
1. Traction timeline (last 5 snapshots)
2. Tactics tried (up to 10)
3. Past recommendations (top 5 via vector)
4. Past insights (top 3 via vector)

`RETURNING_USER_PROMPT` tells Claude to build on past advice, track progress.

---

## Vector Search: pgvector in Supabase

Using pgvector directly (not external DB). Free with Supabase, RLS works, can join with other tables. `match_user_context_chunks` RPC, cosine similarity, 0.5 threshold.

---

## Chunk Types: 5 Categories

| Type | Source | Search Use Case |
|------|--------|-----------------|
| `product` | run_input | Understanding their product |
| `traction` | run_input | Progress over time |
| `tactic` | run_input | What they've tried |
| `insight` | run_output | Past analysis |
| `recommendation` | run_output | Past advice (avoid repeating) |

Enables filtered searches to avoid repeating past recommendations.
