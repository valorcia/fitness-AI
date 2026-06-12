import { prisma } from "@/lib/prisma";
import { anthropic, anthropicModels } from "@/lib/ai/anthropic";
import { embed, embedBatch, isEmbeddingsConfigured } from "@/lib/ai/voyage";
import { logger } from "@/lib/logger";

export type MemoryKind =
  | "injury"
  | "goal"
  | "preference"
  | "life_event"
  | "perf_record"
  | "conversation"
  | "win"
  | "loss";

export type MemoryCandidate = {
  kind: MemoryKind;
  content: string;
  /** 0..10 — higher = more important / longer-lived. */
  weight: number;
};

const MAX_MEMORIES_PER_USER = 200;

/**
 * Persist one or more memories with their embeddings. Atomic per memory —
 * a failed embedding still writes the row so retrieval can fall back to
 * keyword-style search by `kind`.
 */
export async function recordMemories(
  userId: string,
  candidates: MemoryCandidate[],
  source: "chat" | "workout" | "manual" | "onboarding",
): Promise<void> {
  if (candidates.length === 0) return;

  const embeddings = await embedBatch(
    candidates.map((c) => c.content),
    "document",
  ).catch((e) => {
    logger.warn("memory_embed_batch_failed", { error: e instanceof Error ? e.message : String(e) });
    return candidates.map(() => null);
  });

  // Insert rows. We use $executeRaw because pgvector requires raw SQL to
  // write the vector column (Prisma's Unsupported type is read-only).
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i]!;
    const vec = embeddings[i];
    try {
      if (vec) {
        const vecStr = `[${vec.join(",")}]`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO "CoachMemory" ("id", "userId", "kind", "content", "weight", "source", "embedding")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::vector)`,
          userId,
          c.kind,
          c.content,
          c.weight,
          source,
          vecStr,
        );
      } else {
        await prisma.coachMemory.create({
          data: {
            userId,
            kind: c.kind,
            content: c.content,
            weight: c.weight,
            source,
          },
        });
      }
    } catch (e) {
      logger.error("memory_insert_failed", { error: e instanceof Error ? e.message : String(e) });
    }
  }

  // Soft-cap: drop the lowest-weighted memories beyond MAX_MEMORIES_PER_USER.
  await pruneMemories(userId).catch((e) =>
    logger.warn("memory_prune_failed", { error: e instanceof Error ? e.message : String(e) }),
  );
}

async function pruneMemories(userId: string): Promise<void> {
  const count = await prisma.coachMemory.count({ where: { userId } });
  if (count <= MAX_MEMORIES_PER_USER) return;

  const overflow = count - MAX_MEMORIES_PER_USER;
  const toDelete = await prisma.coachMemory.findMany({
    where: { userId },
    orderBy: [{ weight: "asc" }, { createdAt: "asc" }],
    take: overflow,
    select: { id: true },
  });
  if (toDelete.length > 0) {
    await prisma.coachMemory.deleteMany({
      where: { id: { in: toDelete.map((m) => m.id) } },
    });
  }
}

/**
 * Retrieve the top-K most relevant memories for the current user message.
 * Uses cosine similarity on the vector column when Voyage is configured;
 * falls back to recency-weighted retrieval when it isn't.
 *
 * Also bumps `lastUsed` on retrieved rows so frequently-accessed memories
 * resist pruning.
 */
export async function retrieveMemories(
  userId: string,
  query: string,
  topK = 6,
): Promise<Array<{ id: string; kind: string; content: string; weight: number }>> {
  if (!isEmbeddingsConfigured()) {
    return fallbackRetrieval(userId, topK);
  }

  const queryVec = await embed(query, "query").catch(() => null);
  if (!queryVec) return fallbackRetrieval(userId, topK);

  const vecStr = `[${queryVec.join(",")}]`;
  type Row = { id: string; kind: string; content: string; weight: number };

  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `SELECT "id", "kind", "content", "weight"
     FROM "CoachMemory"
     WHERE "userId" = $1 AND "embedding" IS NOT NULL
     ORDER BY ("embedding" <=> $2::vector) ASC, "weight" DESC
     LIMIT $3`,
    userId,
    vecStr,
    topK,
  );

  if (rows.length === 0) return fallbackRetrieval(userId, topK);

  // Bump lastUsed for retrieved rows (best-effort, fire-and-forget).
  prisma.coachMemory
    .updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: { lastUsed: new Date() },
    })
    .catch(() => null);

  return rows;
}

async function fallbackRetrieval(userId: string, topK: number) {
  return prisma.coachMemory.findMany({
    where: { userId },
    orderBy: [{ weight: "desc" }, { createdAt: "desc" }],
    take: topK,
    select: { id: true, kind: true, content: true, weight: true },
  });
}

const EXTRACTION_PROMPT = `Tu reçois un échange entre un utilisateur et son coach sportif IA. Ta mission :
extraire UNIQUEMENT les informations qui méritent d'être mémorisées sur le long terme pour
améliorer la relation coach / utilisateur.

Critères :
- Une mémoire = un fait précis, durable, utile dans plusieurs semaines.
- Ignorer : politesses, météo, plaintes ponctuelles, blagues, tout ce qui est éphémère.
- Privilégier : blessures, objectifs, préférences fortes, événements de vie, records, abandons.

Kinds valides :
- injury        : blessure, douleur récurrente, opération
- goal          : objectif sportif ou vital exprimé
- preference    : préférence d'horaire, type d'exo, équipement, ton du coach
- life_event    : déménagement, changement de boulot, grossesse, deuil, naissance...
- perf_record   : nouveau record (poids, distance, temps, reps)
- win           : succès marquant (premier 10 km, déclic mental, série tenue)
- loss          : abandon, échec assumé, rechute
- conversation  : élément factuel mentionné en passant qu'un humain retiendrait

Format : tableau JSON de 0 à 3 objets. PAS de markdown, PAS de texte autour.
Schéma : { "kind": "...", "content": "phrase courte à la 3e personne, 80 chars max", "weight": 0..10 }

Échelle weight :
- 9-10 : info critique récurrente (blessure permanente, objectif majeur)
- 6-8  : info importante (préférence forte, événement de vie)
- 3-5  : info notable (record, anecdote utile)
- 0-2  : trivial — n'extrait PAS

Si rien ne mérite d'être retenu : []`;

/**
 * Run Haiku 4.5 on the last few turns of a conversation and return memory
 * candidates. Cheap (~$0.001 per call) and fire-and-forget — failures are
 * silent because the chat already succeeded.
 */
export async function extractMemoriesFromConversation(
  excerpt: string,
): Promise<MemoryCandidate[]> {
  if (!anthropic) return [];
  if (excerpt.length < 80) return [];

  try {
    const res = await anthropic.messages.create({
      model: anthropicModels.fast,
      max_tokens: 400,
      temperature: 0.1,
      system: EXTRACTION_PROMPT,
      messages: [{ role: "user", content: excerpt.slice(0, 6000) }],
    });
    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    // Robust JSON extraction (model sometimes wraps the array).
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(parsed)) return [];

    const out: MemoryCandidate[] = [];
    const ALLOWED: ReadonlyArray<MemoryKind> = [
      "injury",
      "goal",
      "preference",
      "life_event",
      "perf_record",
      "conversation",
      "win",
      "loss",
    ];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const r = item as Record<string, unknown>;
      const kind = r.kind;
      const content = r.content;
      const weight = r.weight;
      if (typeof kind !== "string" || !ALLOWED.includes(kind as MemoryKind)) continue;
      if (typeof content !== "string" || content.length < 5 || content.length > 200) continue;
      if (typeof weight !== "number" || weight < 3 || weight > 10) continue;
      out.push({ kind: kind as MemoryKind, content, weight });
      if (out.length >= 3) break;
    }
    return out;
  } catch (e) {
    logger.warn("memory_extraction_failed", { error: e instanceof Error ? e.message : String(e) });
    return [];
  }
}
