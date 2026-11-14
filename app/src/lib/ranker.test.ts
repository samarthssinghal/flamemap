import { describe, expect, it } from 'vitest'
import { gravityDistance, rangeDistance, rank, scoreOne, taskFit, UNKNOWN_DISTANCE } from './ranker'
import type { Environment, Investigation, RangeCond, Task, Weights } from './types'

const spans = { o2_percent: 79, pressure_kpa: 71.7, flow_cm_s: 20, gravity_g: 1 }
const W: Weights = { o2: 0.3, pressure: 0.2, flow: 0.1, gravity: 0.15, task: 0.25 }
const src = { type: 'table_column' as const, ref: 't' }
const rc = (min: number | null, max: number | null): RangeCond => ({ min, max, unit: '', source: src, confidence: 'high' })
const prevent: Task = { id: 'prevent', name: 'Prevention', role: 'prevention', preferred_fuel_classes: ['solid'] }

function inv(p: Partial<Investigation> & { o2?: RangeCond | null; pr?: RangeCond | null; fl?: RangeCond | null; g?: number[] }): Investigation {
  return {
    psi_id: p.psi_id ?? 'PSI-1', acronym: 'X', title: '', doi: '', url: '', license: '', project_type: 'flight', platform: null, hardware: null,
    start_date: null, end_date: null, sub_research_area: null,
    fire_safety_role: p.fire_safety_role ?? 'prevention', secondary_roles: p.secondary_roles ?? [], fuel_class: p.fuel_class ?? 'solid',
    fuel_materials: [], geometry: null,
    conditions: { o2_percent: p.o2 ?? null, pressure_kpa: p.pr ?? null, flow_cm_s: p.fl ?? null, gravity_g: { values: p.g ?? [0], source: src, confidence: 'high' } },
    diluents: [], variables_varied: [], sensors: [],
    evidence: p.evidence ?? { n_runs: 1, table_files: [], data_availability: '', raw_data_gb: null },
    summary: { text: '', why_it_matters: '', generated_by: '', human_reviewed: false }, n_publications: 0, publications: [], related_modeling: [], verified: { by: null, date: null },
  }
}
const env = (o2: number | null, p: number | null, g: number, f: number | null = null): Environment => ({ id: 'e', name: 'e', o2_percent: o2, pressure_kpa: p, gravity_g: g, flow_cm_s: f, sources: [] })

describe('ranker', () => {
  it('1. O2 above range', () => {
    const d = rangeDistance(30, rc(15, 22), 79)!
    expect(d.gap).toBe(8)
    expect(d.distance).toBeCloseTo(0.1013, 3)
  })
  it('2. O2 inside range', () => {
    expect(rangeDistance(21, rc(15, 22), 79)!.distance).toBe(0)
  })
  it('3. pressure below range', () => {
    const d = rangeDistance(70.3, rc(101.3, 101.3), 71.7)!
    expect(d.gap).toBeCloseTo(31.0, 5)
    expect(d.distance).toBeCloseTo(0.4324, 3)
  })
  it('4. gravity', () => {
    expect(gravityDistance(0.166, [0])).toBeCloseTo(0.166, 6)
    expect(gravityDistance(0.38, [0, 1])).toBeCloseTo(0.38, 6)
  })
  it('5. flow cap', () => {
    expect(rangeDistance(40, rc(0, 20), 20)!.distance).toBe(1)
    expect(rangeDistance(100, rc(0, 20), 20)!.distance).toBe(1)
  })
  it('6. unrecorded factor counts as untested (1); factor the environment does not set is skipped', () => {
    // env sets O2, pressure, gravity, task (weights 0.3 + 0.2 + 0.15 + 0.25 = 0.9); flow not set.
    // Pressure not recorded -> 1. Weighted = 0.2 * 1 / 0.9 = 0.222 -> 78.
    const r = scoreOne(env(21, 101.3, 0), prevent, W, inv({ o2: rc(15, 22) }), spans)
    expect(r.relevance).toBe(78)
    expect(r.n_scored).toBe(4)
    expect(r.n_known).toBe(3)
    expect(r.evidence_completeness).toBeCloseTo(0.7 / 0.9, 6)
    expect(r.breakdown.find((b) => b.factor === 'flow')!.status).toBe('not_set')
    expect(r.breakdown.find((b) => b.factor === 'flow')!.distance).toBeNull()
  })
  it('7. full worked example = 84', () => {
    const r = scoreOne(env(30, 70.3, 0.166), prevent, W, inv({ o2: rc(15, 22), pr: rc(101.3, 101.3) }), spans)
    expect(r.relevance).toBe(84)
  })
  it('8. task fit', () => {
    expect(taskFit(inv({ fuel_class: 'gas' }), prevent).fit).toBeCloseTo(0.6, 6)
    expect(taskFit(inv({ fire_safety_role: 'fundamental' }), prevent).fit).toBeCloseTo(0.55, 6)
    expect(taskFit(inv({ fire_safety_role: 'detection', secondary_roles: ['prevention'], fuel_class: 'gas' }), prevent).fit).toBeCloseTo(0.3, 6)
  })
  it('9. sort tie-breaks: completeness, then runs, then id', () => {
    const e = env(21, 101.3, 0)
    const a = inv({ psi_id: 'PSI-3', o2: rc(15, 22) })
    const b = inv({ psi_id: 'PSI-2', o2: rc(15, 22), pr: rc(101.3, 101.3) })
    const c = inv({ psi_id: 'PSI-1', o2: rc(15, 22), evidence: { n_runs: 9, table_files: [], data_availability: '', raw_data_gb: null } })
    expect(rank(e, prevent, W, [a, b, c], spans).map((x) => x.inv.psi_id)).toEqual(['PSI-2', 'PSI-1', 'PSI-3'])
  })
  it('10. null is never treated as 0 or as inside', () => {
    expect(rangeDistance(21, null, 79)).toBeNull()
    expect(rangeDistance(null, rc(15, 22), 79)).toBeNull()
    const r = scoreOne(env(21, 101.3, 0), prevent, W, inv({}), spans)
    expect(r.breakdown.find((b) => b.factor === 'o2')!.status).toBe('unknown')
    expect(r.breakdown.find((b) => b.factor === 'o2')!.distance).toBe(UNKNOWN_DISTANCE)
  })
  it('11. one-sided range from text uses the known bound', () => {
    expect(rangeDistance(50, rc(null, 40), 20)!.gap).toBe(10)
  })
  it('12. missing data never raises the score (R02)', () => {
    // A study with nothing recorded must score below one that recorded every factor inside range
    // (under the old renormalization both scored 100).
    const e = env(21, 101.3, 0)
    const full = scoreOne(e, prevent, W, inv({ o2: rc(15, 22), pr: rc(101.3, 101.3) }), spans)
    const empty = scoreOne(e, prevent, W, inv({}), spans)
    expect(full.relevance).toBe(100)
    expect(empty.relevance).toBeLessThan(full.relevance)
  })
  it('13. unrecorded O2 never beats a recorded O2, even one a full span away', () => {
    const e = env(100, 101.3, 0)
    const missing = scoreOne(e, prevent, W, inv({ pr: rc(101.3, 101.3) }), spans)
    const farthest = scoreOne(e, prevent, W, inv({ o2: rc(21, 21), pr: rc(101.3, 101.3) }), spans) // gap 79 = span
    expect(missing.relevance).toBe(farthest.relevance)
    const nearer = scoreOne(e, prevent, W, inv({ o2: rc(15, 40), pr: rc(101.3, 101.3) }), spans)
    expect(nearer.relevance).toBeGreaterThan(missing.relevance)
  })
})
