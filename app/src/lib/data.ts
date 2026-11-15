import type { AiLabel, Brief, EnvFile, Finding, GapFile, Investigation, QA, Related, RunPoint } from './types'

export interface Insights {
  snapshot_date: string
  n_investigations: number
  n_table_rows: number
  n_run_points: number
  n_publications_listed: number
  n_related_modeling: number
  max_o2_solid: { value: number; psi_id: string; acronym: string }
  max_o2_any: { value: number; psi_id: string }
  min_recorded_pressure: { value: number; psi_id: string; acronym: string }
  solid_investigations_with_recorded_pressure: number
  runs_o2_ge_30: { total: number }
  runs_o2_ge_30_and_p_le_75: { total: number; solid: number }
  by_role: Record<string, number>
  by_fuel_class: Record<string, number>
  by_data_availability: Record<string, number>
}
export interface SourceFile {
  psi: { psi_id: string; acronym: string | null; title: string; doi: string; url: string; license: string; used_as: string }[]
  other: { title: string; url: string }[]
}
export interface EarthFile {
  spinoffs: { title: string; era: string; blurb: string; url: string }[]
  history: { title: string; blurb: string; url: string }[]
}
export interface AppData {
  investigations: Investigation[]
  runs: RunPoint[]
  env: EnvFile
  gaps: GapFile[]
  insights: Insights
  sources: SourceFile
  earth: EarthFile
  findings: (Finding & { psi_ids: string[] })[]
  ai: AiLabel
  briefs: Brief[]
  qa: QA[]
  related: Record<string, Related[]>
}

const get = async <T,>(f: string): Promise<T> => {
  const r = await fetch(`./data/${f}`)
  if (!r.ok) throw new Error(`Could not load ${f} (${r.status})`)
  return r.json() as Promise<T>
}

export async function loadData(): Promise<AppData> {
  const [investigations, runs, env, gaps, insights, sources, earth, findings, briefs, qa, related] = await Promise.all([
    get<Investigation[]>('investigations.json'),
    get<RunPoint[]>('runs.json'),
    get<EnvFile>('environments.json'),
    get<GapFile[]>('gaps.json'),
    get<Insights>('insights.json'),
    get<SourceFile>('sources.json'),
    get<EarthFile>('earth_applications.json'),
    get<AppData['findings']>('findings.json'),
    get<AiLabel & { briefs: Brief[] }>('briefs.json'),
    get<AiLabel & { questions: QA[] }>('qa.json'),
    get<AiLabel & { related: Record<string, Related[]> }>('related.json'),
  ])
  const { briefs: _b, ...ai } = briefs
  return { investigations, runs, env, gaps, insights, sources, earth, findings, ai, briefs: _b, qa: qa.questions, related: related.related }
}

export const ROLE_LABEL: Record<string, string> = { prevention: 'Prevention', detection: 'Detection', suppression: 'Suppression', fundamental: 'Fundamental' }
export const FUEL_LABEL: Record<string, string> = { solid: 'Solid fuel', liquid_droplet: 'Liquid droplet', gas: 'Gas fuel', aerosol: 'Smoke / aerosol' }
export const AVAIL_LABEL: Record<string, string> = {
  run_table_with_conditions: 'Run table with conditions',
  run_table_partial: 'Run table, partial conditions',
  run_log_only: 'Run log only',
  metadata_only: 'Metadata only',
}
export const CONF_LABEL: Record<string, string> = { high: 'from data table', medium: 'from record text', low: 'assumed' }

const n1 = (x: number) => (Math.round(x * 10) / 10).toString()
export function fmtRange(c: { min: number | null; max: number | null } | null, unit = ''): string {
  if (!c || (c.min === null && c.max === null)) return 'not recorded'
  const u = unit ? ` ${unit}` : ''
  if (c.min === null) return `up to ${n1(c.max as number)}${u}`
  if (c.max === null) return `from ${n1(c.min)}${u}`
  if (c.min === c.max) return `${n1(c.min)}${u}`
  return `${n1(c.min)} to ${n1(c.max)}${u}`
}
export const psi = (kpa: number) => (kpa / 6.89476).toFixed(1)

export const SRC_LABEL: Record<string, string> = { table_column: 'from data table', psi_text: 'from record text', publication: 'from publication', assumed_platform: 'assumed' }
