import type { Investigation, RankedItem } from './types'

function download(name: string, text: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
const cell = (v: unknown) => {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n')
}
export const flatInv = (i: Investigation) => ({
  psi_id: i.psi_id, acronym: i.acronym, title: i.title, doi: i.doi, url: i.url,
  fire_safety_role: i.fire_safety_role, fuel_class: i.fuel_class, fuel_materials: i.fuel_materials.join('; '),
  o2_min_percent: i.conditions.o2_percent?.min ?? null, o2_max_percent: i.conditions.o2_percent?.max ?? null, o2_source: i.conditions.o2_percent?.source.ref ?? null, o2_confidence: i.conditions.o2_percent?.confidence ?? null,
  pressure_min_kpa: i.conditions.pressure_kpa?.min ?? null, pressure_max_kpa: i.conditions.pressure_kpa?.max ?? null, pressure_source: i.conditions.pressure_kpa?.source.ref ?? null, pressure_confidence: i.conditions.pressure_kpa?.confidence ?? null,
  airflow_min_cm_s: i.conditions.flow_cm_s?.min ?? null, airflow_max_cm_s: i.conditions.flow_cm_s?.max ?? null, airflow_source: i.conditions.flow_cm_s?.source.ref ?? null, airflow_confidence: i.conditions.flow_cm_s?.confidence ?? null,
  gravity_g: i.conditions.gravity_g.values.join('; '), table_rows: i.evidence.n_runs, data_availability: i.evidence.data_availability, platform: i.platform, hardware: i.hardware,
})
export const flatRank = (r: RankedItem, idx: number) => {
  const f = (k: string) => r.breakdown.find((b) => b.factor === k)
  return {
    rank: idx + 1, relevance: r.relevance, factors_recorded: r.n_known, factors_scored: r.n_scored, evidence_completeness: Math.round(r.evidence_completeness * 100) / 100,
    distance_o2: f('o2')?.distance ?? null, distance_pressure: f('pressure')?.distance ?? null, distance_airflow: f('flow')?.distance ?? null, distance_gravity: f('gravity')?.distance ?? null, distance_task: f('task')?.distance ?? null,
    flags: r.flags.join('; '), ...flatInv(r.inv),
  }
}
export const saveCsv = (name: string, rows: Record<string, unknown>[]) => download(name, toCsv(rows), 'text/csv')
export const saveJson = (name: string, data: unknown) => download(name, JSON.stringify(data, null, 2), 'application/json')
