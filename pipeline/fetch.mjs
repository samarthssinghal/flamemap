// Downloads the PSI snapshot used by build_data.mjs into pipeline/raw/.
//   raw/<PSI-ID>.json          trimmed investigation record (PLAN.md P1.2 field list)
//   raw/tables/<file_name>     every "Experimental table" CSV listed on the record
//   raw/manifest.json          fetch date, source URL and sha256 of every saved file
// Cached: files already on disk are not downloaded again. Use --force to refresh everything.
// Usage: node pipeline/fetch.mjs [--force] [PSI-25 PSI-26 ...]
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAW = join(dirname(fileURLToPath(import.meta.url)), 'raw')
const TABLES = join(RAW, 'tables')
mkdirSync(TABLES, { recursive: true })

const API = 'https://psi.nasa.gov/geode-py/ws'
const RANKED = ['PSI-25', 'PSI-26', 'PSI-98', 'PSI-99', 'PSI-100', 'PSI-102', 'PSI-101', 'PSI-47', 'PSI-69', 'PSI-68', 'PSI-39', 'PSI-20', 'PSI-10', 'PSI-159', 'PSI-21', 'PSI-22', 'PSI-23', 'PSI-107', 'PSI-106']
const MODELING = ['PSI-62', 'PSI-60', 'PSI-115', 'PSI-117', 'PSI-142']
const KEEP = ['accession', 'investigationAcronym', 'title', 'doi', 'researchArea', 'subResearchArea', 'projectType', 'flightProgram', 'experimentHardware', 'investigationStartDate', 'investigationEndDate', 'objective', 'approach', 'hypothesis', 'researchImpacts', 'publications', 'experimentalTable', 'related_glds', 'licenseIdentifier', 'totalFileSize', 'modifiedDate', 'version']
const DELAY_MS = 500

const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => a.startsWith('PSI-'))
const ids = only.length ? only : [...RANKED, ...MODELING]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha = (buf) => createHash('sha256').update(buf).digest('hex')
async function get(u, as = 'text') {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'flamemap-pipeline' } })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      await sleep(DELAY_MS)
      return as === 'json' ? r.json() : Buffer.from(await r.arrayBuffer())
    } catch (e) {
      if (attempt >= 3) throw new Error(`${u}: ${e.message}`)
      await sleep(DELAY_MS * 4 * attempt)
    }
  }
}

const manifestPath = join(RAW, 'manifest.json')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { files: {} }
let fetched = 0
const record = (rel, buf, source) => (fetched++, manifest.files[rel] = { source, sha256: sha(buf), bytes: buf.length, fetched_at: new Date().toISOString() })

for (const id of ids) {
  const recPath = join(RAW, `${id}.json`)
  let rec
  if (!force && existsSync(recPath)) {
    rec = JSON.parse(readFileSync(recPath, 'utf8'))
  } else {
    const src = `${API}/repo/investigations/${id}`
    const full = await get(src, 'json')
    if (full.accession !== id) throw new Error(`${id}: response accession is ${full.accession}`)
    rec = Object.fromEntries(KEEP.map((k) => [k, full[k] ?? null]))
    const buf = Buffer.from(JSON.stringify(rec, null, 1) + '\n')
    writeFileSync(recPath, buf)
    record(`${id}.json`, buf, src)
    console.log(`record  ${id}`)
  }
  for (const t of rec.experimentalTable ?? []) {
    const name = t.file_name
    const out = join(TABLES, name)
    if (!force && existsSync(out)) continue
    const src = `${API}/studies/${id}/download?file=${encodeURIComponent(name)}&version=1&redirect=false`
    const signed = (await get(src)).toString('utf8').trim()
    if (!/^https:\/\//.test(signed)) throw new Error(`${id} ${name}: expected a signed URL, got ${signed.slice(0, 80)}`)
    const buf = await get(signed)
    writeFileSync(out, buf)
    record(`tables/${name}`, buf, src)
    console.log(`table   ${name} (${buf.length} bytes)`)
  }
}

if (fetched) manifest.updated_at = new Date().toISOString()
manifest.files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n')
console.log(`done: ${fetched} downloaded, ${Object.keys(manifest.files).length} files in manifest`)
