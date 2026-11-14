// Parses the cached PSI "Experimental table" CSVs in pipeline/raw/tables/ into:
//   tables[psi_id]  -> { files, n_rows, n_runs, o2, pressure, flow }  (ranges as {min, max, column})
//   points[]        -> one entry per run that has both O2 and pressure, at full resolution,
//                      with its source file and data-row number (1 = first row after the header)
// Every rule here is logged in docs/DATA_CLEANING_LOG.md. Pure function of the files on disk.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CABIN_KPA = 101.3
const KPA = { atm: 101.325, bar: 100, mmHg: 0.133322 }

// RFC 4180 CSV: quoted fields may contain commas, quotes ("") and newlines. Strips a UTF-8 BOM.
export function parseCsv(text) {
  text = text.replace(/^﻿/, '')
  const rows = []
  let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') q = false
      else cell += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows
}

const norm = (h) => h.replace(/\s+/g, ' ').trim().toLowerCase()

function load(dir, id, suffix) {
  const file = `${id}_Experimental table_${suffix}`
  const [header, ...body] = parseCsv(readFileSync(join(dir, file), 'utf8'))
  const cols = header.map(norm)
  const data = []
  body.forEach((cells, k) => {
    if (!cells.some((c) => c.trim() !== '')) return // blank padding rows
    const rec = { _row: k + 1 }
    cols.forEach((h, j) => (rec[h] = (cells[j] ?? '').trim()))
    data.push(rec)
  })
  const col = (name) => {
    const n = norm(name)
    if (!cols.includes(n)) throw new Error(`${file}: column "${name}" not found. Headers: ${header.join(' | ')}`)
    return n
  }
  return { file, data, col }
}

// Whole table by file name, for checking quoted cells (findings). Rows are keyed by normalized header;
// `_key` is the trimmed first cell, used to address a row ("S1", "2-8").
export function readTable(dir, file) {
  const [header, ...body] = parseCsv(readFileSync(join(dir, file), 'utf8'))
  const cols = header.map(norm)
  const rows = body.filter((c) => c.some((x) => x.trim() !== '')).map((c) => Object.fromEntries([['_key', (c[0] ?? '').trim()], ...cols.map((h, j) => [h, (c[j] ?? '').trim()])]))
  return { header, cols, rows, norm }
}

// Plain number, or null for blanks and text such as "RAMP", "LOW O2", "none".
const num = (s) => (s !== '' && Number.isFinite(Number(s)) ? Number(s) : null)
// All numbers in a cell such as "21.5 - 21.7", "~ 21.5", "0.17; 0.21;0.25; 0.3", "30 cm/s", "-5.92".
const nums = (s) => [...s.matchAll(/-?\d*\.?\d+/g)].map((m) => Number(m[0]))
const r1 = (v) => Math.round(v * 10) / 10

function range(values, column) {
  const v = values.filter((x) => x !== null && Number.isFinite(x))
  if (!v.length) return null
  return { min: r1(Math.min(...v)), max: r1(Math.max(...v)), column, n_values: v.length }
}

export function parseTables(dir) {
  const tables = {}
  const points = []
  const put = (id, t) => (tables[id] = { o2: null, pressure: null, flow: null, ...t })
  const point = (psi_id, file, row, o2, p_kpa, p_assumed, flame = null) => points.push({ psi_id, file, row, o2_percent: o2, pressure_kpa: p_kpa, pressure_assumed: p_assumed, flame_type: flame })

  { // PSI-25 BASS-II: one run per row; cabin pressure assumed (MSG glovebox)
    const t = load(dir, 'PSI-25', 'BASS-II.csv'), c = t.col('Calibrated initial O2 % by vol')
    t.data.forEach((r) => { const o = num(r[c]); if (o !== null) point('PSI-25', t.file, r._row, o, CABIN_KPA, true) })
    put('PSI-25', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, o2: range(t.data.map((r) => num(r[c])), c) })
  }
  { const t = load(dir, 'PSI-26', 'BASS.csv'); put('PSI-26', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length }) }
  { // PSI-98 SAFFIRE-1: burn samples are the "S<n>" rows; the others are flow-visualization rows
    const t = load(dir, 'PSI-98', 'SAFFIRE-1.csv'), s = t.col('Sample Number'), samples = t.data.filter((r) => /^S\d+$/.test(r[s]))
    put('PSI-98', { files: [t.file], n_rows: t.data.length, n_runs: samples.length, o2: range(samples.flatMap((r) => nums(r[t.col('Percent O2')])), t.col('Percent O2')), flow: range(samples.flatMap((r) => nums(r[t.col('Air Flow (cm/s)')])), t.col('Air Flow (cm/s)')) })
  }
  { // PSI-99 SAFFIRE-2: burn samples are the "2-<n>" rows; others are calibration and notes
    const t = load(dir, 'PSI-99', 'SAFFIRE-2.csv'), s = t.col('Sample Number'), samples = t.data.filter((r) => /^2-\d+$/.test(r[s]))
    const oc = t.col('Percent O2 (Note 1)'), fc = t.col('Air Flow (cm/s)')
    put('PSI-99', { files: [t.file], n_rows: t.data.length, n_runs: samples.length, o2: range(samples.flatMap((r) => nums(r[oc])), oc), flow: range(samples.flatMap((r) => nums(r[fc])), fc) })
  }
  { const t = load(dir, 'PSI-100', 'SAFFIRE-3.csv'), fc = t.col('Air Flow'); put('PSI-100', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, flow: range(t.data.flatMap((r) => nums(r[fc])), fc) }) }
  { const t = load(dir, 'PSI-102', 'SAME.csv'), fc = t.col('Air Flow (cm/s)'); put('PSI-102', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, flow: range(t.data.map((r) => num(r[fc])), fc) }) }
  { const t = load(dir, 'PSI-101', 'SAME-R.csv'), fc = t.col('Inlet velocity (cm/s)'); put('PSI-101', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, flow: range(t.data.map((r) => num(r[fc])), fc) }) }
  { const t = load(dir, 'PSI-47', 'DAFT.csv'); put('PSI-47', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length }) }
  { // PSI-69 FLEX: mole fraction -> %, mmHg -> kPa; a pressure of 0 is a recording error (dropped)
    const t = load(dir, 'PSI-69', 'FLEX.csv'), oc = t.col('O initial ambient composition; mole fraction'), pc = t.col('Ambient pressure; mmHg')
    const o2 = (r) => (num(r[oc]) === null ? null : num(r[oc]) * 100)
    const p = (r) => (num(r[pc]) ? num(r[pc]) * KPA.mmHg : null)
    t.data.forEach((r) => { if (o2(r) !== null && p(r) !== null) point('PSI-69', t.file, r._row, o2(r), p(r), false) })
    put('PSI-69', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, o2: range(t.data.map(o2), oc), pressure: range(t.data.map(p), pc) })
  }
  { // PSI-68 FLEX-2: cells list several values; ranges only, no run points
    const t = load(dir, 'PSI-68', 'Flex2.csv'), oc = t.col('Oxygen Mole Fraction'), pc = t.col('Ambient Pressure (atm)'), fc = t.col('Flow Velocity (cm/s)')
    put('PSI-68', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, o2: range(t.data.flatMap((r) => nums(r[oc]).map((v) => v * 100)), oc), pressure: range(t.data.flatMap((r) => nums(r[pc]).map((v) => v * KPA.atm)), pc), flow: range(t.data.flatMap((r) => nums(r[fc])), fc) })
  }
  { // PSI-39 CFI: "Oxygen" is a mole fraction; "Pressure" is text like "1 atm"
    const t = load(dir, 'PSI-39', 'CFI.csv'), oc = t.col('Oxygen'), pc = t.col('Pressure')
    const o2 = (r) => (num(r[oc]) === null ? null : num(r[oc]) * 100)
    const p = (r) => { const m = r[pc].match(/^(\d*\.?\d+)\s*atm$/i); return m ? Number(m[1]) * KPA.atm : null }
    t.data.forEach((r) => { if (o2(r) !== null && p(r) !== null) point('PSI-39', t.file, r._row, o2(r), p(r), false) })
    put('PSI-39', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, o2: range(t.data.map(o2), oc), pressure: range(t.data.map(p), pc) })
  }
  { // PSI-20 ACME BRE: lists like "21; 26.5; 40"; "3400%" and "2100%" are spreadsheet formatting for 34 and 21
    const t = load(dir, 'PSI-20', 'ACME BRE.csv'), oc = t.col('Oxygen Conc (percent)')
    const vals = (s) => (/^\d+00%$/.test(s) ? [Number(s.slice(0, -3))] : nums(s))
    put('PSI-20', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, o2: range(t.data.flatMap((r) => vals(r[oc])), oc) })
  }
  // PSI-10 Flame Design and PSI-159 CFI-G: one normal-flame table and one inverse-flame table each.
  // In the inverse tables the chamber holds fuel + N2 ("Xf before test", "XC2H4 initial") and XO2 is the
  // O2 fraction of the burner's oxidizer stream, not the chamber atmosphere (REVIEW_ISSUES.md R01).
  // So the ambient O2 and pressure ranges use the normal-flame table only; inverse-flame ranges are
  // reported separately as `inverse`. Every point carries flame_type so callers can filter.
  for (const [id, files, pName, pUnit] of [
    ['PSI-10', [['Flame Design_Normal Flame.csv', 'XO2 (init)', 'normal'], ['Flame Design_Inverse Flame.csv', 'XO2', 'inverse']], 'pinit (atm)', 'atm'],
    ['PSI-159', [['CFI-G_Normal Flames.csv', 'XO2 before test', 'normal'], ['CFI-G_Inverse Flames.csv', 'XO2', 'inverse']], 'approx p (bar)', 'bar'],
  ]) {
    const v = { normal: { o2: [], p: [], n: 0 }, inverse: { o2: [], p: [], n: 0 } }, used = []
    for (const [suffix, oName, flame] of files) {
      const t = load(dir, id, suffix), oc = t.col(oName), pc = t.col(pName)
      used.push(t.file); v[flame].n += t.data.length
      t.data.forEach((r) => {
        const o = num(r[oc]) === null ? null : num(r[oc]) * 100, p = num(r[pc]) === null ? null : num(r[pc]) * KPA[pUnit]
        v[flame].o2.push(o); v[flame].p.push(p)
        if (o !== null && p !== null) point(id, t.file, r._row, o, p, false, flame)
      })
    }
    const n = v.normal.n + v.inverse.n
    put(id, {
      files: used, n_rows: n, n_runs: n,
      o2: range(v.normal.o2, files[0][1]), pressure: range(v.normal.p, pName),
      inverse: { file: used[1], n_rows: v.inverse.n, oxidizer_stream_o2: range(v.inverse.o2, files[1][1]), pressure: range(v.inverse.p, pName) },
    })
  }
  for (const [id, suffix] of [['PSI-21', 'CLD Flame.csv'], ['PSI-22', 'ACME E-FIELD Flames.csv'], ['PSI-106', 'Slice.csv']]) {
    const t = load(dir, id, suffix); put(id, { files: [t.file], n_rows: t.data.length, n_runs: t.data.length })
  }
  { // PSI-23 s-Flame: "~21% O2 with N2" (approximate)
    const t = load(dir, 'PSI-23', 'ACME s-Flame.csv'), oc = t.col('Atmosphere*')
    put('PSI-23', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, o2: range(t.data.map((r) => { const m = r[oc].match(/(\d*\.?\d+)\s*%\s*O2/); return m ? Number(m[1]) : null }), oc) })
  }
  { const t = load(dir, 'PSI-107', 'Spice.csv'), fc = t.col('Air Rate (cm/s)'); put('PSI-107', { files: [t.file], n_rows: t.data.length, n_runs: t.data.length, flow: range(t.data.map((r) => num(r[fc])), fc) }) }

  return { tables, points }
}
