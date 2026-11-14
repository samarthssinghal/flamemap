export type Role = 'prevention' | 'detection' | 'suppression' | 'fundamental'
export type FuelClass = 'solid' | 'liquid_droplet' | 'gas' | 'aerosol'
export type Confidence = 'high' | 'medium' | 'low'
export type SourceType = 'table_column' | 'psi_text' | 'publication' | 'assumed_platform'

export interface Source { type: SourceType; ref: string }
export interface RangeCond { min: number | null; max: number | null; unit: string; source: Source; confidence: Confidence }
export interface GravityCond { values: number[]; source: Source; confidence: Confidence }

export interface Investigation {
  psi_id: string
  acronym: string
  title: string
  doi: string
  url: string
  license: string
  project_type: 'flight' | 'ground'
  platform: string | null
  hardware: string | null
  start_date: string | null
  end_date: string | null
  sub_research_area: string | null
  fire_safety_role: Role
  secondary_roles: Role[]
  fuel_class: FuelClass
  fuel_materials: string[]
  geometry: string | null
  conditions: {
    o2_percent: RangeCond | null
    pressure_kpa: RangeCond | null
    flow_cm_s: RangeCond | null
    gravity_g: GravityCond
  }
  diluents: string[]
  variables_varied: string[]
  sensors: string[]
  evidence: { n_runs: number | null; table_files: string[]; data_availability: string; raw_data_gb: number | null }
  summary: { text: string; why_it_matters: string; generated_by: string; human_reviewed: boolean }
  n_publications: number
  publications: { title: string; doi: string | null }[]
  related_modeling: { psi_id: string; title: string; url: string }[]
  verified: { by: string | null; date: string | null }
  gravity_comparison?: {
    caveat: string
    source: string
    rows: { sample: string; material: string; o2_percent: string; microgravity_burn: string; one_g_burn: string }[]
  }
}

export interface RunPoint {
  psi_id: string
  acronym: string
  fuel_class: FuelClass
  o2_percent: number | null
  pressure_kpa: number | null
  pressure_assumed: boolean
  flow_cm_s: number | null
  n: number
}

export interface ValueSource { field: string; status: 'verified' | 'nominal_assumption' | 'from_challenge_statement' | 'reference'; url?: string; note?: string }
export interface Environment {
  id: string
  name: string
  o2_percent: number | null
  pressure_kpa: number | null
  gravity_g: number
  flow_cm_s: number | null
  sources: ValueSource[]
  note?: string
}
export interface Task { id: string; name: string; role: Role; preferred_fuel_classes: FuelClass[] }
export interface Weights { o2: number; pressure: number; flow: number; gravity: number; task: number }
export interface EnvFile {
  reference_spans: { o2_percent: number; pressure_kpa: number; flow_cm_s: number; gravity_g: number }
  default_weights: Weights
  environments: Environment[]
  tasks: Task[]
}

export interface Gap {
  id: string
  severity: 'high' | 'medium' | 'info'
  text: string
  computed_from: { metric: string; value: number | string | null }
  sources: string[]
}
export interface GapFile { environment_id: string; gaps: Gap[] }

export type FactorKey = 'o2' | 'pressure' | 'flow' | 'gravity' | 'task'
export interface Factor {
  factor: FactorKey
  label: string
  env_value: number | string | null
  tested_min: number | null
  tested_max: number | null
  gap: number | null
  distance: number | null
  weight: number
  status: 'inside' | 'outside' | 'unknown' | 'match' | 'partial' | 'mismatch'
  unit: string
  source: Source | null
  confidence: Confidence | null
}
export interface RankedItem {
  inv: Investigation
  relevance: number
  evidence_completeness: number
  n_known: number
  breakdown: Factor[]
  flags: string[]
}
