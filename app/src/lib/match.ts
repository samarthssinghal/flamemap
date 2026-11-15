// Matching a visitor's question to the checked answers (AI_FIRST_PLAN.md §2). Pure functions, no model:
// used by the browser and by tests. The embedding model itself is loaded in semantic.ts.
import type { QA } from './types'

export interface VectorFile { model: string; dtype: string; dim: number; items: { kind: 'qa' | 'finding'; id: string; v: string }[] }
export interface VectorItem { kind: 'qa' | 'finding'; id: string; v: Int8Array }

/** Base64 int8 vectors (value × 127) as written by pipeline/embed.mjs. */
export function decodeVectors(f: VectorFile): VectorItem[] {
  return f.items.map((x) => {
    const bin = atob(x.v)
    const v = new Int8Array(bin.length)
    for (let i = 0; i < bin.length; i++) v[i] = (bin.charCodeAt(i) << 24) >> 24
    return { kind: x.kind, id: x.id, v }
  })
}

/** Cosine similarity of a normalized query with every item; a question with paraphrases keeps its best score. */
export function similarities(q: ArrayLike<number>, items: VectorItem[]): Map<string, number> {
  const best = new Map<string, number>()
  for (const it of items) {
    let s = 0
    for (let i = 0; i < it.v.length; i++) s += it.v[i] * q[i]
    s /= 127
    const k = `${it.kind}:${it.id}`
    if (s > (best.get(k) ?? -Infinity)) best.set(k, s)
  }
  return best
}

/** Above this, a checked answer is shown as an answer to the question. */
export const ANSWER_AT = 0.5
/** Above this (and below ANSWER_AT), it is offered as a nearby question instead. */
export const NEARBY_AT = 0.35

// ---------- keyword fallback (used until the model has loaded, or if it cannot load) ----------
const STOP = new Set('a an and any are as at be by can could do does for from has have how i in is it its of on or than that the there this to was were what when where which who why will with would'.split(' '))
const SYN: Record<string, string> = { o2: 'oxygen', moon: 'lunar', fabric: 'cotton', extinguish: 'suppress', extinguishment: 'suppress', suppression: 'suppress', suppressant: 'suppress', suppressants: 'suppress', detector: 'detect', detectors: 'detect', detection: 'detect', smoke: 'smoke', ventilation: 'airflow', fan: 'airflow', flow: 'airflow', suit: 'spacesuit', eva: 'spacesuit', gravity: 'gravity', habitat: 'habitat', base: 'habitat' }
export const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9%.\s-]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map((w) => SYN[w] ?? SYN[w.replace(/s$/, '')] ?? w.replace(/s$/, ''))

/** Word-overlap score of the visitor's question with each curated question (question and tags count more than answer text). */
export function keywordScores(q: string, qa: QA[]): Map<string, number> {
  const want = new Set(words(q))
  const out = new Map<string, number>()
  if (!want.size) return out
  for (const x of qa) {
    const head = new Set(words(`${x.question} ${x.tags.join(' ')}`))
    const body = new Set(words(x.answer.map((a) => a.text).join(' ')))
    let score = 0
    for (const w of want) score += head.has(w) ? 2 : body.has(w) ? 1 : 0
    out.set(x.id, score / Math.sqrt(want.size))
  }
  return out
}
