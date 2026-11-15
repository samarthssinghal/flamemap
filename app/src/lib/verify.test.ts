import { describe, expect, it } from 'vitest'
import { decodeVectors, keywordScores, similarities } from './match'
import { buildAliases, checkSentence, numbersIn, type Resolver } from './verify'

const aliases = buildAliases([
  { psi_id: 'PSI-25', acronym: 'BASS-II' },
  { psi_id: 'PSI-69', acronym: 'FLEX' },
  { psi_id: 'PSI-98', acronym: 'SAFFIRE-I' },
])
const resolve: Resolver = (c) => {
  if (c === 'PSI-25') return [{ text: 'BASS-II oxygen 15 22.2 runs 112', psiId: 'PSI-25' }]
  if (c === 'PSI-98') return [{ text: 'SAFFIRE-I cotton-fiberglass', psiId: 'PSI-98' }]
  if (c === 'gap:o2') return [{ text: 'highest solid-fuel oxygen 22.2, 7.8 points below' }]
  return [{ error: `unknown cite ${c}` }]
}

describe('checkSentence', () => {
  it('passes a sentence whose numbers and names are all backed by its cites', () => {
    const r = checkSentence('s', { text: 'The highest oxygen in BASS-II is 22.2%, 7.8 points below.', cites: ['PSI-25', 'gap:o2'] }, resolve, aliases)
    expect(r).toEqual({ errors: [], numbers: 2, named: 1 })
  })
  it('rejects a number not found in what the sentence cites', () => {
    expect(checkSentence('s', { text: 'BASS-II went up to 25%.', cites: ['PSI-25'] }, resolve, aliases).errors).toEqual(['s: number 25 is not in what it cites (PSI-25)'])
  })
  it('rejects a study named but not cited', () => {
    expect(checkSentence('s', { text: 'FLEX found cool flames.', cites: ['PSI-25'] }, resolve, aliases).errors).toEqual(['s: names FLEX but does not cite PSI-69'])
  })
  it('rejects a sentence without citations', () => {
    expect(checkSentence('s', { text: 'A lunar habitat at 30% oxygen is safe.', cites: [] }, resolve, aliases).errors).toEqual(['s: needs text and at least one cite'])
  })
  it('rejects a citation that does not resolve', () => {
    expect(checkSentence('s', { text: 'See the data.', cites: ['F999'] }, resolve, aliases).errors).toEqual(['s: unknown cite F999'])
  })
  it('rejects a closest-evidence claim outside the computed top list', () => {
    expect(checkSentence('s', { text: 'Saffire-I is closest.', cites: ['PSI-98'] }, resolve, aliases, [{ key: 'iss/prevent', top: ['PSI-25'] }]).errors).toEqual(['s: PSI-98 is not in the top 1 for iss/prevent (top: PSI-25)'])
  })
  it('does not treat digits in formulas as quantities', () => {
    expect(numbersIn('CO2 and SF6 at 21.0% O2')).toEqual(['21'])
  })
})

describe('matching', () => {
  it('decodes int8 vectors and keeps the best score per question', () => {
    const b64 = (a: number[]) => btoa(String.fromCharCode(...a.map((x) => x & 255)))
    const items = decodeVectors({ model: 'm', dtype: 'q8', dim: 2, items: [
      { kind: 'qa', id: 'a', v: b64([127, 0]) },
      { kind: 'qa', id: 'a', v: b64([0, 127]) },
      { kind: 'qa', id: 'b', v: b64([-127, 0]) },
    ] })
    const s = similarities([0, 1], items)
    expect(s.get('qa:a')).toBeCloseTo(1)
    expect(s.get('qa:b')).toBeCloseTo(0)
  })
  it('scores keyword overlap with synonyms', () => {
    const qa = [{ id: 'v', question: 'Does shutting off ventilation put a fire out?', tags: ['airflow'], answer: [] }, { id: 'm', question: 'Moon gravity?', tags: [], answer: [] }]
    const s = keywordScores('turn off the fan', qa)
    expect(s.get('v')!).toBeGreaterThan(s.get('m')!)
  })
})
