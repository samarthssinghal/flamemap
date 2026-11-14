import type { Environment, EnvFile, Factor, Investigation, RangeCond, RankedItem, Task, Weights } from './types'

type Spans = EnvFile['reference_spans']

const r1 = (x: number) => Math.round(x * 10) / 10

/**
 * Distance used when the environment sets a factor but the investigation did not record it.
 * A condition that was not recorded is no evidence that it was tested, so it counts as untested:
 * the maximum distance, 1. (Skipping it, as earlier versions did, let studies with missing data
 * outrank studies that recorded the value; a midpoint of 0.5 still did for extreme environments
 * such as the 100% O2 spacesuit. REVIEW_ISSUES R02.)
 */
export const UNKNOWN_DISTANCE = 1

/** Distance for a tested range. Returns null when either side is unknown (never treats unknown as 0). */
export function rangeDistance(envValue: number | null, cond: RangeCond | null, span: number): { gap: number; distance: number; lo: number; hi: number } | null {
  if (envValue === null || envValue === undefined || !cond) return null
  let lo = cond.min
  let hi = cond.max
  if (lo === null && hi === null) return null
  if (lo === null) lo = hi as number
  if (hi === null) hi = lo
  let gap = 0
  if (envValue < lo) gap = lo - envValue
  else if (envValue > hi) gap = envValue - hi
  return { gap, distance: Math.min(1, gap / span), lo, hi }
}

export function gravityDistance(envG: number, values: number[]): number {
  return Math.min(1, Math.min(...values.map((g) => Math.abs(envG - g))))
}

export function taskFit(inv: Investigation, task: Task): { fit: number; roleMatch: number; fuelMatch: number } {
  let roleMatch = 0
  if (inv.fire_safety_role === task.role) roleMatch = 1
  else if (inv.secondary_roles.includes(task.role)) roleMatch = 0.5
  else if (inv.fire_safety_role === 'fundamental') roleMatch = 0.25
  const fuelMatch = task.preferred_fuel_classes.includes(inv.fuel_class) ? 1 : 0
  return { fit: 0.6 * roleMatch + 0.4 * fuelMatch, roleMatch, fuelMatch }
}

export function scoreOne(env: Environment, task: Task, w: Weights, inv: Investigation, spans: Spans): RankedItem {
  const flags: string[] = []
  const breakdown: Factor[] = []
  const ranges: { key: 'o2' | 'pressure' | 'flow'; label: string; env: number | null; cond: RangeCond | null; span: number; unit: string; weight: number }[] = [
    { key: 'o2', label: 'Oxygen', env: env.o2_percent, cond: inv.conditions.o2_percent, span: spans.o2_percent, unit: '% O2', weight: w.o2 },
    { key: 'pressure', label: 'Pressure', env: env.pressure_kpa, cond: inv.conditions.pressure_kpa, span: spans.pressure_kpa, unit: 'kPa', weight: w.pressure },
    { key: 'flow', label: 'Airflow', env: env.flow_cm_s, cond: inv.conditions.flow_cm_s, span: spans.flow_cm_s, unit: 'cm/s', weight: w.flow },
  ]
  for (const r of ranges) {
    const d = rangeDistance(r.env, r.cond, r.span)
    if (!d) {
      // Environment does not set this factor: skipped for every investigation alike.
      // Investigation did not record it: scored at UNKNOWN_DISTANCE.
      const notSet = r.env === null || r.env === undefined
      breakdown.push({ factor: r.key, label: r.label, env_value: r.env, tested_min: r.cond?.min ?? null, tested_max: r.cond?.max ?? null, gap: null, distance: notSet ? null : UNKNOWN_DISTANCE, weight: r.weight, status: notSet ? 'not_set' : 'unknown', unit: r.unit, source: r.cond?.source ?? null, confidence: r.cond?.confidence ?? null })
      if (!notSet) flags.push(`${r.label} not recorded`)
      continue
    }
    const status = d.gap === 0 ? 'inside' : 'outside'
    breakdown.push({ factor: r.key, label: r.label, env_value: r.env, tested_min: r.cond!.min, tested_max: r.cond!.max, gap: d.gap, distance: d.distance, weight: r.weight, status, unit: r.unit, source: r.cond!.source, confidence: r.cond!.confidence })
    if (status === 'outside') {
      const dir = (r.env as number) > d.hi ? 'above' : 'below'
      flags.push(`${r.label} ${dir} tested range by ${r1(d.gap)} ${r.key === 'o2' ? 'points' : r.unit}`)
    }
    if (r.cond!.source.type === 'assumed_platform') flags.push(`${r.label} assumed, not recorded`)
    if (r.cond!.source.type === 'psi_text') flags.push(`${r.label} taken from record text`)
  }
  const g = inv.conditions.gravity_g
  const dg = gravityDistance(env.gravity_g, g.values)
  breakdown.push({ factor: 'gravity', label: 'Gravity', env_value: env.gravity_g, tested_min: Math.min(...g.values), tested_max: Math.max(...g.values), gap: dg, distance: dg, weight: w.gravity, status: dg === 0 ? 'inside' : 'outside', unit: 'g', source: g.source, confidence: g.confidence })
  if (dg > 0 && g.values.every((v) => v === 0)) flags.push('Microgravity only')

  const tf = taskFit(inv, task)
  breakdown.push({ factor: 'task', label: 'Task fit', env_value: task.name, tested_min: null, tested_max: null, gap: null, distance: 1 - tf.fit, weight: w.task, status: tf.fit >= 0.99 ? 'match' : tf.fit > 0 ? 'partial' : 'mismatch', unit: '', source: null, confidence: null })

  // Scored = every factor the environment sets (unknown ones at UNKNOWN_DISTANCE). Weights are rescaled
  // only over factors the environment sets, which is the same set for every investigation.
  const scored = breakdown.filter((b) => b.distance !== null)
  const recorded = scored.filter((b) => b.status !== 'unknown')
  const wScored = scored.reduce((s, b) => s + b.weight, 0)
  const wRecorded = recorded.reduce((s, b) => s + b.weight, 0)
  const weighted = wScored > 0 ? scored.reduce((s, b) => s + b.weight * (b.distance as number), 0) / wScored : 1
  return {
    inv,
    relevance: Math.round(100 * (1 - weighted)),
    evidence_completeness: wScored > 0 ? wRecorded / wScored : 0,
    n_known: recorded.length,
    n_scored: scored.length,
    breakdown,
    flags,
  }
}

export function rank(env: Environment, task: Task, w: Weights, invs: Investigation[], spans: Spans): RankedItem[] {
  return invs
    .map((i) => scoreOne(env, task, w, i, spans))
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        b.evidence_completeness - a.evidence_completeness ||
        (b.inv.evidence.n_runs ?? 0) - (a.inv.evidence.n_runs ?? 0) ||
        a.inv.psi_id.localeCompare(b.inv.psi_id),
    )
}

/** Plain-language sentences built only from the computed breakdown. */
export function explain(item: RankedItem): string[] {
  const out: string[] = []
  for (const b of item.breakdown) {
    if (b.factor === 'task') {
      out.push(b.status === 'match' ? 'Fire-safety role and fuel type both match the selected task.' : b.status === 'partial' ? `Partial match to the selected task (task fit ${Math.round((1 - (b.distance as number)) * 100)}%).` : 'Role and fuel type do not match the selected task.')
    } else if (b.status === 'unknown') {
      out.push(`${b.label}: not recorded for this investigation, so it counts as untested (distance ${UNKNOWN_DISTANCE}, the maximum).`)
    } else if (b.status === 'not_set') {
      out.push(`${b.label}: not set for this environment, so it is not scored for any investigation.`)
    } else if (b.factor === 'gravity') {
      out.push(b.status === 'inside' ? `Gravity: tested at ${b.env_value} g, the same as this environment.` : `Gravity: tested at ${item.inv.conditions.gravity_g.values.join(' and ')} g; this environment is ${b.env_value} g.`)
    } else {
      const range = b.tested_min === b.tested_max || b.tested_min === null || b.tested_max === null ? `${r1((b.tested_max ?? b.tested_min) as number)}` : `${r1(b.tested_min)} to ${r1(b.tested_max)}`
      out.push(b.status === 'inside' ? `${b.label}: tested ${range} ${b.unit}; this environment (${b.env_value}) is inside that range.` : `${b.label}: tested ${range} ${b.unit}; this environment needs ${b.env_value} (${r1(b.gap as number)} outside the tested range).`)
    }
  }
  return out
}
