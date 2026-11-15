// Sentence checks for AI-written text (REVIEW_ISSUES R06d).
// Shared by the build (pipeline/ai_build.mjs, which imports this file through Node's type stripping)
// and by the browser, so that any future live answer is held to the same rules as the checked text.
// Keep it free of browser-only and Node-only APIs.

export interface CitedSentence { text: string; cites: string[] }

/** What one cite contributes: checkable text (and the investigation it names), or an error. */
export type Resolved = { text: string; psiId?: string } | { error: string }
export type Resolver = (cite: string) => Resolved[]

export interface Alias { id: string; acronym: string; re: RegExp }

/** Numbers that state a quantity. Digits inside formulas (O2, CO2, SF6, C2H4) are not quantities. */
export const numbersIn = (s: string): string[] => [...String(s).matchAll(/(?<![A-Za-z\d.])\d+(?:\.\d+)?/g)].map((m) => m[0].replace(/\.0+$/, ''))

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Names a sentence can use for an investigation: the acronym, without the ACME prefix, each half of "A / B". */
export function buildAliases(invs: { psi_id: string; acronym: string }[]): Alias[] {
  return invs.flatMap((i) => {
    const names = new Set([i.acronym, i.acronym.replace(/^ACME /, ''), ...i.acronym.split(' / ')])
    for (const n of [...names]) if (/^SAFFIRE/.test(n)) names.add(n.replace('SAFFIRE', 'Saffire'))
    return [...names].filter((n) => n.length >= 3).map((n) => ({ id: i.psi_id, acronym: i.acronym, re: new RegExp(`(?<![\\w-])${esc(n)}(?![\\w-])`) }))
  })
}

export interface CheckResult { errors: string[]; numbers: number; named: number }

/**
 * Checks one sentence. It must have at least one cite; every cite must resolve; every number must appear in
 * the text of what it cites; every investigation it names must be cited; and, for a "closest evidence" claim,
 * every cited investigation must be in the computed top list of each view it is shown for.
 */
export function checkSentence(where: string, s: CitedSentence, resolve: Resolver, aliases: Alias[], closest: { key: string; top: string[] }[] = []): CheckResult {
  if (!s.text || !Array.isArray(s.cites) || s.cites.length === 0) return { errors: [`${where}: needs text and at least one cite`], numbers: 0, named: 0 }
  const errors: string[] = []
  let corpus = ''
  const citedPsi = new Set<string>()
  for (const c of s.cites) {
    for (const r of resolve(c)) {
      if ('error' in r) { errors.push(`${where}: ${r.error}`); continue }
      corpus += ' ' + r.text
      if (r.psiId) citedPsi.add(r.psiId)
    }
  }
  const have = new Set(numbersIn(corpus))
  const nums = numbersIn(s.text)
  for (const n of nums) if (!have.has(n)) errors.push(`${where}: number ${n} is not in what it cites (${s.cites.join(', ')})`)
  const named = new Set<string>()
  for (const a of aliases) {
    if (!a.re.test(s.text)) continue
    named.add(a.id)
    if (!citedPsi.has(a.id)) errors.push(`${where}: names ${a.acronym} but does not cite ${a.id}`)
  }
  for (const v of closest) for (const id of citedPsi) if (!v.top.includes(id)) errors.push(`${where}: ${id} is not in the top ${v.top.length} for ${v.key} (top: ${v.top.join(', ')})`)
  return { errors, numbers: nums.length, named: named.size }
}
