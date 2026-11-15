// Answer providers for "Ask the evidence" (AI_FIRST_PLAN.md §2).
// This build ships one provider: checked answers, written by AI at build time and verified, matched to the
// question by meaning (semantic) or, until the model loads, by keywords. A live provider (the visitor's own
// key or a hosted proxy) would implement the same interface, return source 'live', and run its sentences
// through lib/verify.ts before showing them.
import type { AppData } from './data'
import type { Cited, Finding } from './types'
import { ANSWER_AT, NEARBY_AT, keywordScores, similarities, words } from './match'
import { loadSemantic, type SemanticIndex } from './semantic'

export interface Answer { id: string; question: string; sentences: Cited[]; source: 'checked' | 'live'; score: number }
export interface AnswerResult {
  method: 'semantic' | 'keyword' | 'live'
  answers: Answer[]
  /** Checked questions close to, but not clearly answering, the visitor's question. */
  nearby: { id: string; question: string }[]
  findings: (Finding & { psi_ids: string[] })[]
}
export interface AnswerProvider { id: string; ask: (q: string, data: AppData) => Promise<AnswerResult> }

const KW_WEIGHT = 0.06 // a small boost for shared key words, so "spacesuit" prefers the spacesuit answer
const MAX_ANSWERS = 3
const ANSWER_SPREAD = 0.08 // show further answers only if nearly as close as the best one

const toAnswer = (data: AppData, id: string, score: number): Answer => {
  const x = data.qa.find((q) => q.id === id)!
  return { id, question: x.question, sentences: x.answer, source: 'checked', score }
}

/** Keyword-only matching: the fallback, and the behavior before semantic search existed. */
export function keywordAnswers(q: string, data: AppData): AnswerResult {
  const kw = keywordScores(q, data.qa)
  const answers = [...kw].filter(([, s]) => s >= 1).sort((a, b) => b[1] - a[1]).slice(0, MAX_ANSWERS).map(([id, s]) => toAnswer(data, id, s))
  const want = new Set(words(q))
  const findings = want.size ? data.findings.filter((f) => words(f.text).filter((w) => want.has(w)).length >= Math.min(2, want.size)).slice(0, 4) : []
  return { method: 'keyword', answers, nearby: [], findings }
}

export async function semanticAnswers(q: string, data: AppData, index: SemanticIndex): Promise<AnswerResult> {
  const sims = similarities(await index.embed(q), index.items)
  const kw = keywordScores(q, data.qa)
  const scored = data.qa
    .map((x) => ({ id: x.id, s: (sims.get(`qa:${x.id}`) ?? 0) + KW_WEIGHT * Math.min(kw.get(x.id) ?? 0, 3) }))
    .sort((a, b) => b.s - a.s)
  const best = scored[0]?.s ?? 0
  const answers = scored.filter((r) => r.s >= ANSWER_AT && r.s >= best - ANSWER_SPREAD).slice(0, MAX_ANSWERS).map((r) => toAnswer(data, r.id, r.s))
  const nearby = scored.filter((r) => r.s >= NEARBY_AT && !answers.some((a) => a.id === r.id)).slice(0, answers.length ? 2 : 3).map((r) => ({ id: r.id, question: data.qa.find((x) => x.id === r.id)!.question }))
  const findings = data.findings
    .map((f) => ({ f, s: sims.get(`finding:${f.id}`) ?? 0 }))
    .filter((r) => r.s >= ANSWER_AT)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((r) => r.f)
  return { method: 'semantic', answers, nearby, findings }
}

/** The provider this build ships: checked answers, matched by meaning once the in-browser model is ready. */
export const checkedAnswers: AnswerProvider = {
  id: 'checked',
  ask: async (q, data) => {
    const index = await loadSemantic()
    return index ? semanticAnswers(q, data, index) : keywordAnswers(q, data)
  },
}
