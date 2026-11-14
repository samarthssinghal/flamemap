// Builds app/public/data/*.json from the cached PSI snapshot in pipeline/raw/ (fetched by pipeline/fetch.mjs).
//   raw/<PSI-ID>.json     record metadata: DOI, dates, license, file size, publications, table list, text
//   raw/tables/*.csv      experimental tables, parsed by pipeline/tables.mjs into ranges, run counts and run points
// Hand-written here: classification (role, fuel class), cleaned-up names, text-derived fields (each with a
// verbatim quote that is checked against the record text), environments and summaries.
// Every computed number is compared with pipeline/expected.json; the build fails on any difference.
// Usage: node pipeline/build_data.mjs [--accept]   (--accept rewrites expected.json after an intended change)
// See docs/DATA_CLEANING_LOG.md.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CABIN_KPA, parseTables } from './tables.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const RAW = join(HERE, 'raw')
const OUT = join(HERE, '..', 'app', 'public', 'data')
mkdirSync(OUT, { recursive: true })
const MANIFEST = JSON.parse(readFileSync(join(RAW, 'manifest.json'), 'utf8'))
const SNAPSHOT_DATE = MANIFEST.updated_at.slice(0, 10)
for (const [rel, m] of Object.entries(MANIFEST.files)) {
  const h = createHash('sha256').update(readFileSync(join(RAW, rel))).digest('hex')
  if (h !== m.sha256) throw new Error(`raw/${rel} does not match its sha256 in raw/manifest.json (edited by hand, or line endings changed?)`)
}
const REC = {}
const rec = (id) => {
  if (!REC[id]) {
    const p = join(RAW, `${id}.json`)
    if (!existsSync(p)) throw new Error(`${p} missing: run node pipeline/fetch.mjs`)
    REC[id] = JSON.parse(readFileSync(p, 'utf8'))
  }
  return REC[id]
}
const { tables: TABLES, points: ALL_POINTS } = parseTables(join(RAW, 'tables'))
// Ambient-atmosphere run points only: inverse-flame rows (PSI-10, PSI-159) record the burner's oxidizer
// stream, not the chamber atmosphere, so they are left out of bins and coverage counts (REVIEW_ISSUES R01).
const POINTS = ALL_POINTS.filter((p) => p.flame_type !== 'inverse')

const url = (id) => `https://psi.nasa.gov/physci/repo/data/investigations/${id}`
const tbl = (id, f, col) => ({ type: 'table_column', ref: `${id}_Experimental table_${f} :: ${col}` })
const txt = (q) => ({ type: 'psi_text', ref: q })
const CABIN = { min: CABIN_KPA, max: CABIN_KPA, unit: 'kPa', source: { type: 'assumed_platform', ref: 'Ran in cabin or module air (glovebox or Cygnus); pressure is not in the experimental table, so about 1 atm is assumed' }, confidence: 'low' }
const R = (min, max, unit, source, confidence = 'high') => ({ min, max, unit, source, confidence })
const UNIT = { o2: '%', pressure: 'kPa', flow: 'cm/s' }
// Range parsed from the experimental table (pipeline/tables.mjs)
const T = (id, field, source, confidence = 'high') => {
  const r = TABLES[id]?.[field]
  if (!r) throw new Error(`${id}: no ${field} range parsed from the table`)
  return R(r.min, r.max, UNIT[field], source, confidence)
}
const decode = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
const clean = (s) => decode(s ?? '').replace(/\s+/g, ' ').trim()
const isoDate = (s) => { const m = (s ?? '').match(/^(\d{2})-(\d{2})-(\d{4})$/); return m ? `${m[3]}-${m[1]}-${m[2]}` : null } // PSI dates are MM-DD-YYYY
const recordText = (id) => clean(['objective', 'approach', 'hypothesis', 'researchImpacts'].map((k) => rec(id)[k]).join(' '))

// id, acronym, title, sub, platform, hardware, role, secondary, fuel, materials, geometry,
// o2, pressure, flow, availability, diluents, varied, sensors, summary, why
// (DOI, dates, license, file size, publications, table files and run counts come from raw/.)
const I = [
  { id: 'PSI-25', ac: 'BASS-II', title: 'Burning and Suppression of Solids - II', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Microgravity Science Glovebox (MSG)',
    role: 'prevention', sec: ['suppression'], fuel: 'solid', mats: ['PMMA films and sheets of several thicknesses'], geom: 'Samples mounted in a small wind tunnel; opposed and concurrent flow',
    o2: T('PSI-25', 'o2', tbl('PSI-25', 'BASS-II.csv', 'Calibrated initial O2 % by vol')), p: CABIN, flow: R(null, 40, 'cm/s', txt('"a small wind tunnel which could impose airflow speeds up to 40 cm/s"'), 'medium'),
    avail: 'run_table_with_conditions', dil: ['N2'], varied: ['airflow speed', 'oxygen concentration', 'flow direction'], sensors: ['imaging', 'radiometer', 'O2, CO2 and CO readings'],
    sum: 'Solid fuel samples were burned in a small wind tunnel inside the station glovebox. Airflow speed and oxygen concentration were the main variables, with oxygen lowered below 21% by adding nitrogen. The team recorded flame appearance, growth and spread rate in opposed and concurrent flow, and studied ignition and extinction limits.',
    why: 'Aims to link the normal-gravity NASA-STD-6001 Test 1 method to actual material flammability in microgravity, to help select safer materials.' },
  { id: 'PSI-26', ac: 'BASS', title: 'Burning and Suppression of Solids', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Microgravity Science Glovebox',
    role: 'prevention', sec: ['suppression'], fuel: 'solid', mats: ['cotton-fiberglass fabric (SIBAL)', 'Nomex', 'Ultem', 'PMMA spheres'], geom: 'Flat fabric, spheres and cylinders in a 76 mm x 76 mm flow duct',
    o2: null, p: CABIN, flow: R(null, 40, 'cm/s', txt('"airflow speeds reaching as high as 40 cm/s"'), 'medium'),
    avail: 'run_log_only', dil: [], varied: ['airflow speed', 'flow direction', 'material', 'geometry'], sensors: ['imaging (top and edge views)'],
    sum: 'Fabric, plastic and other solid samples were ignited in a small flow duct inside the station glovebox, with a fan setting the airflow in the opposed or concurrent direction. Flame size, shape, color, spread rate and quenching were observed. A second objective was to assess an inert gaseous extinguishing agent.',
    why: 'Spacecraft materials are selected with a 1-g test (NASA-STD-6001 Test 1); BASS examines how that relates to burning in microgravity.' },
  { id: 'PSI-98', ac: 'SAFFIRE-I', title: 'Spacecraft Fire Safety Experiment-I', sub: 'Spacecraft Fire, Smoke Distribution', plat: 'International Space Station (ISS)', hw: 'Saffire 1 enclosure in Cygnus',
    role: 'prevention', sec: [], fuel: 'solid', mats: ['cotton-fiberglass fabric (SIBAL)'], geom: 'One large sample, about 0.94 m long and 0.4 m wide, in a flow duct',
    o2: T('PSI-98', 'o2', tbl('PSI-98', 'SAFFIRE-1.csv', 'Percent O2')), p: CABIN, flow: T('PSI-98', 'flow', tbl('PSI-98', 'SAFFIRE-1.csv', 'Air Flow (cm/s)')),
    avail: 'run_table_with_conditions', dil: [], varied: ['flow direction'], sensors: ['two cameras', 'thermocouples', 'radiometers'],
    sum: 'A large piece of cotton-fiberglass fabric, about 0.94 meters long and 0.4 meters wide, was burned inside a Cygnus cargo vehicle after it left the station. Air was drawn through a flow duct at 20 cm/s. Cameras, thermocouples and radiometers recorded how the flame grew.',
    why: 'Tests how rapidly a large-scale fire grows in low gravity and compares low-g flammability limits with the normal-gravity screening test.' },
  { id: 'PSI-99', ac: 'SAFFIRE-II', title: 'Spacecraft Fire Experiment-II', sub: 'Surface Combustion', plat: 'Cygnus Spacecraft', hw: 'Cygnus Pressurized Cargo Module, SAFFIRE',
    role: 'prevention', sec: [], fuel: 'solid', mats: ['silicone', 'cotton-fiberglass fabric (SIBAL)', 'PMMA', 'PMMA with Nomex'], geom: '9 samples, each 5 cm x 29 cm, on one sample card',
    o2: T('PSI-99', 'o2', tbl('PSI-99', 'SAFFIRE-2.csv', 'Percent O2 (Note 1)')), p: CABIN, flow: R(20, 30, 'cm/s', txt('"conducted at an air flow velocity of either 20 or 30 cm/s"'), 'medium'),
    avail: 'run_table_with_conditions', dil: [], varied: ['material', 'flow direction', 'airflow speed'], sensors: ['two cameras', 'thermocouples', 'radiometers', 'pressure, CO2 and O2 sensors'],
    sum: 'Nine samples, each 5 cm by 29 cm, were burned on a Cygnus cargo vehicle after it left the station. Materials included silicone, cotton-fiberglass fabric and PMMA. Airflow was 20 or 30 cm/s, concurrent or opposed. The data table lists burn lengths in microgravity next to normal-gravity results.',
    why: 'Compares low-gravity flammability limits with those from NASA\'s normal-gravity material screening test, across several materials.' },
  { id: 'PSI-100', ac: 'SAFFIRE-III', title: 'Spacecraft Fire Experiment-III', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Saffire III enclosure in Cygnus',
    role: 'prevention', sec: [], fuel: 'solid', mats: ['cotton-fiberglass fabric (SIBAL)'], geom: 'Large sample, 94 cm x 40.6 cm',
    o2: null, p: CABIN, flow: T('PSI-100', 'flow', tbl('PSI-100', 'SAFFIRE-3.csv', 'Air Flow')),
    avail: 'run_table_partial', dil: [], varied: ['flow direction'], sensors: ['two cameras', 'thermocouples', 'radiometers', 'pressure, CO2 and O2 sensors', 'anemometers'],
    sum: 'A follow-on to Saffire-I using the same cotton-fiberglass fabric on a Cygnus cargo vehicle, but at a flow velocity of 30 cm/s compared with 20 cm/s. The flow was concurrent or opposed. Cameras, thermocouples, radiometers and gas sensors recorded the burn.',
    why: 'Extends the large-scale fire-growth test to a higher airflow, for comparison with the normal-gravity flammability screening test.' },
  { id: 'PSI-102', ac: 'SAME', title: 'Smoke and Aerosol Measurement Experiment', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Comparative Soot Diagnostic hardware',
    role: 'detection', sec: [], fuel: 'aerosol', mats: ['Teflon', 'Kapton', 'silicone rubber', 'lampwick', 'dibutyl phthalate'], geom: 'Overheated samples in the glovebox',
    o2: null, p: CABIN, flow: T('PSI-102', 'flow', tbl('PSI-102', 'SAME.csv', 'Air Flow (cm/s)')),
    avail: 'run_table_partial', dil: [], varied: ['material', 'airflow', 'aging duration'], sensors: ['two smoke detectors', 'thermophoretic soot samplers', 'video cameras'],
    sum: 'Smoke from overheated spacecraft materials was produced in the station glovebox and sampled. Two smoke detectors were tested against it, and collected particles were later examined with an electron microscope to measure particle dimensions. Sample mass loss was also measured.',
    why: 'Provides data on how sensitive existing smoke detectors are to reduced-gravity smoke, toward an advanced fire detector for long missions.' },
  { id: 'PSI-101', ac: 'SAME-R', title: 'Smoke Aerosol Measurement Experiment-Reflight', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Comparative Soot Diagnostic hardware',
    role: 'detection', sec: [], fuel: 'aerosol', mats: ['Kapton', 'silicone', 'lampwick', 'Teflon', 'Pyrell foam'], geom: 'Overheated samples in the glovebox',
    o2: null, p: CABIN, flow: T('PSI-101', 'flow', tbl('PSI-101', 'SAME-R.csv', 'Inlet velocity (cm/s)')),
    avail: 'run_table_partial', dil: [], varied: ['material', 'heating temperature', 'inlet velocity', 'aging'], sensors: ['smoke detector instruments', 'thermal precipitator'],
    sum: 'A reflight of SAME on the same hardware with changes: a new fire-retardant foam sample, broader test conditions including higher heating temperatures and no flow during heating, and a new instrument. The goal was to quantify smoke particle sizes in low gravity. 66 test points were completed.',
    why: 'Together with SAME, its results can lead to an advanced fire detector for spacecraft on long-duration missions.' },
  { id: 'PSI-47', ac: 'DAFT / DAFT-2', title: 'Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'TSI P-Trak',
    role: 'detection', sec: [], fuel: 'aerosol', mats: ['Arizona Road Dust (test aerosol)'], geom: 'Aerosol held in 15-liter Mylar bags',
    o2: null, p: CABIN, flow: null,
    avail: 'run_log_only', dil: [], varied: ['instrument', 'sampled location'], sensors: ['modified P-Trak particle counter', 'DustTrak'],
    sum: 'A risk-reduction test for SAME. A commercial particle counter, the P-Trak, relies on gravity, so it was modified for microgravity and checked on orbit against a second instrument using a standard dust aerosol held in 15-liter bags. No combustion took place.',
    why: 'Longer missions on larger vessels need fire detection with better reliability and sensitivity; this checked a key smoke-measurement instrument.' },
  { id: 'PSI-69', ac: 'FLEX', title: 'Flame Extinguishment Experiment', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), Multi-user Droplet Combustion Apparatus',
    role: 'suppression', sec: [], fuel: 'liquid_droplet', mats: ['methanol', 'heptane'], geom: 'Single droplets, about 1 to 5 mm',
    o2: T('PSI-69', 'o2', tbl('PSI-69', 'FLEX.csv', 'O initial ambient composition; mole fraction')), p: T('PSI-69', 'pressure', tbl('PSI-69', 'FLEX.csv', 'Ambient pressure; mmHg')), flow: null,
    avail: 'run_table_with_conditions', dil: ['N2', 'CO2', 'He'], varied: ['oxygen mole fraction', 'pressure', 'diluent', 'droplet size', 'fuel'], sensors: ['droplet and flame imaging'],
    sum: 'Single droplets of liquid fuel were ignited in a sealed chamber while oxygen level, pressure and diluent gas were changed. The aim was to map flammability limits in microgravity, including the limiting oxygen index as a function of pressure, and to measure how well gaseous suppressants such as CO2 and He work.',
    why: 'Directly supports fire-suppression choices for spacecraft, where traditional suppression methods may be ineffective.' },
  { id: 'PSI-68', ac: 'FLEX-2', title: 'Flame Extinguishment Experiment - 2', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), Multi-user Droplet Combustion Apparatus (MDCA)',
    role: 'fundamental', sec: ['suppression'], fuel: 'liquid_droplet', mats: ['iso-octane', 'n-octane', 'heptane', 'decane', 'ethanol', 'propanol-glycerol', 'heptane-iso-octane'], geom: 'Droplets, 1.5 to 5 mm initial diameter',
    o2: T('PSI-68', 'o2', tbl('PSI-68', 'Flex2.csv', 'Oxygen Mole Fraction')), p: T('PSI-68', 'pressure', tbl('PSI-68', 'Flex2.csv', 'Ambient Pressure (atm)')), flow: T('PSI-68', 'flow', tbl('PSI-68', 'Flex2.csv', 'Flow Velocity (cm/s)')),
    avail: 'run_table_with_conditions', dil: ['N2', 'He'], varied: ['fuel', 'oxygen mole fraction', 'pressure', 'flow velocity', 'droplet size'], sensors: ['droplet and flame imaging'],
    sum: 'Extends FLEX to more fuels, including two-component droplets, and to a wider range of conditions. The chamber atmosphere was varied in pressure and oxygen concentration with a diluent gas making up the balance. The results are benchmark data for validating simulations and new models of droplet burning and extinction.',
    why: 'Adds flame-extinction data for more fuels and atmospheres, though its stated focus is engine-relevant combustion more than spacecraft fire safety.' },
  { id: 'PSI-39', ac: 'CFI', title: 'Cool Flames Investigation', sub: 'Droplets', plat: 'International Space Station (ISS)', hw: 'Multi-User Droplet Combustion Apparatus (MDCA), Combustion Integrated Rack (CIR)',
    role: 'fundamental', sec: [], fuel: 'liquid_droplet', mats: ['n-dodecane', 'n-dodecane / iso-dodecane mixtures'], geom: 'Droplets suspended on needles or fibers',
    o2: T('PSI-39', 'o2', tbl('PSI-39', 'CFI.csv', 'Oxygen')), p: T('PSI-39', 'pressure', tbl('PSI-39', 'CFI.csv', 'Pressure')), flow: null,
    avail: 'run_table_with_conditions', dil: ['N2', 'He'], varied: ['pressure', 'helium dilution', 'fuel mixture', 'droplet size'], sensors: ['black-and-white camera for droplet size'],
    sum: 'Fuel droplets were burned in a sealed chamber to study cool flames, a low-temperature burning mode. The tests varied pressure and helium dilution and looked at how droplet size and pressure relate to flame extinction, using n-dodecane and its mixtures.',
    why: 'Cool flames matter for understanding ignition of practical fuels; a flame that keeps burning in a cool mode is also relevant to knowing when a fire is truly out.' },
  { id: 'PSI-20', ac: 'ACME BRE', title: 'Advanced Combustion via Microgravity Experiments - Burning Rate Emulator', sub: 'Flames of Gaseous Fuels', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME',
    role: 'prevention', sec: [], fuel: 'gas', mats: ['ethylene (C2H4)', 'methane (CH4)', 'nitrogen-diluted mixtures'], geom: 'Porous circular burners, 25 and 50 mm diameter',
    o2: T('PSI-20', 'o2', tbl('PSI-20', 'ACME BRE.csv', 'Oxygen Conc (percent)')), p: null, flow: null,
    avail: 'run_table_partial', dil: ['N2'], varied: ['oxygen concentration', 'pressure (not listed in the summary table)', 'burner size', 'fuel'], sensors: ['burner surface temperature and heat flux'],
    sum: 'A gas burner was used to emulate the burning of solid and liquid materials in still microgravity air. Gas flames on porous circular burners of 25 and 50 mm diameter were observed while oxygen concentration and pressure were varied, to build a flammability map in terms of material properties.',
    why: 'Burning matching materials such as PMMA and Nylon was observed without air flow, although stopping ventilation is an established step in fighting spacecraft fires.' },
  { id: 'PSI-10', ac: 'ACME Flame Design', title: 'Advanced Combustion via Microgravity Experiments / Flame Design', sub: 'Flames of Gaseous Fuels', plat: 'International Space Station (ISS)', hw: 'Advanced Combustion via Microgravity Experiments (ACME), Combustion Integrated Rack',
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['ethylene (C2H4)', 'propane (C3H8)'], geom: 'Spherical diffusion flames, normal and inverse',
    o2: T('PSI-10', 'o2', tbl('PSI-10', 'Flame Design_Normal Flame.csv', 'XO2 (init) (normal-flame table only; inverse-flame XO2 is the burner oxidizer stream, the chamber holds fuel + N2)')), p: T('PSI-10', 'pressure', tbl('PSI-10', 'Flame Design_Normal Flame.csv', 'pinit (atm) (normal-flame table only; inverse-flame XO2 is the burner oxidizer stream, the chamber holds fuel + N2)')), flow: null,
    avail: 'run_table_with_conditions', dil: ['N2', 'CO2'], varied: ['oxygen fraction', 'pressure', 'dilution', 'flow rate', 'flame direction'], sensors: ['cameras', 'radiometers', 'photomultiplier tubes', 'thermocouples'],
    sum: 'Spherical gas flames were studied on the station over a broad range of dilutions, flow rates and pressures, in both normal and inverse directions. The aim was to find soot-inception limits and take detailed measurements, observing the flames with cameras, radiometers and thermocouples.',
    why: 'Not aimed at fire safety, but its normal flames burned in chamber atmospheres of up to 40% oxygen, among the highest in this collection, at about 1 atm.' },
  { id: 'PSI-159', ac: 'ACME CFI-G', title: 'Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases', sub: 'Flames of Gaseous Fuels', plat: 'International Space Station (ISS)', hw: 'ACME, Combustion Integrated Rack (CIR)',
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['ethane', 'propane', 'butane'], geom: 'Spherical diffusion flames, normal and inverse',
    o2: T('PSI-159', 'o2', tbl('PSI-159', 'CFI-G_Normal Flames.csv', 'XO2 before test (normal-flame table only; inverse-flame XO2 is the burner oxidizer stream, the chamber holds fuel + N2)')), p: T('PSI-159', 'pressure', tbl('PSI-159', 'CFI-G_Normal Flames.csv', 'approx p (bar) (normal-flame table only; inverse-flame XO2 is the burner oxidizer stream, the chamber holds fuel + N2)')), flow: null,
    avail: 'run_table_with_conditions', dil: [], varied: ['fuel', 'oxygen fraction', 'pressure', 'dilution', 'flame direction'], sensors: ['cameras', 'radiometers', 'photomultiplier tubes', 'thermocouples'],
    sum: 'Spherical gas flames were run on the station with several fuels over a range of dilutions, flow rates and pressures, in normal and inverse directions, to find the conditions where cool diffusion flames occur. The flight tests are supported by simulations and chemical-kinetics work.',
    why: 'Not aimed at fire safety, but its normal flames burned in atmospheres of up to 40% oxygen, including tests near half an atmosphere.' },
  { id: 'PSI-21', ac: 'ACME CLD Flame', title: 'Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame', sub: 'Flames of gaseous fuel', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME',
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene'], geom: 'Coflow burner',
    o2: null, p: null, flow: null,
    avail: 'run_table_partial', dil: ['N2'], varied: ['coflow velocity', 'fuel dilution'], sensors: ['chemiluminescence imaging', 'soot luminosity', 'laser extinction'],
    sum: 'Methane and ethylene flames on a coflow burner were studied from very dilute to heavily sooting conditions. Measurements include flame shape, lift-off height, extinction limits and soot. The data are meant for rigorous testing of computational models with improved soot sub-models.',
    why: 'Improves prediction of flame extinction and soot, the flame type found in most practical combustion devices.' },
  { id: 'PSI-22', ac: 'ACME E-FIELD Flames', title: 'Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames', sub: 'Laminar Flames', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME',
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene'], geom: 'Gas-jet and coflow burners with a mesh electrode',
    o2: null, p: null, flow: null,
    avail: 'run_table_partial', dil: [], varied: ['electric field strength', 'mesh polarity', 'fuel concentration'], sensors: ['ion current', 'imaging'],
    sum: 'Tests how electric fields change gas flames in microgravity, where the effect can be separated from buoyancy. A high voltage, up to 10 kV, was applied between the burner and a mesh above it, and the ion current and the flame response were measured.',
    why: 'The record says the work is not being conducted to serve space applications, though findings could aid future space-based combustion devices.' },
  { id: 'PSI-23', ac: 'ACME s-Flame', title: 'Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames', sub: 'Flames of gaseous fuels', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME',
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['hydrogen', 'methane', 'ethylene'], geom: 'Spherical porous burner',
    o2: T('PSI-23', 'o2', tbl('PSI-23', 'ACME s-Flame.csv', 'Atmosphere* (approximate values)'), 'medium'), p: null, flow: null,
    avail: 'run_table_partial', dil: ['N2', 'He'], varied: ['fuel mixture', 'atmosphere', 'diluent'], sensors: ['spectrally resolved imaging', 'flame and burner temperatures', 'radiative flux'],
    sum: 'Mixtures of gaseous fuels and diluents were fed through a spherical porous burner to make a nominally spherical, one-dimensional flame. Images, temperatures and radiative flux were recorded for comparison with detailed numerical simulations, using hydrogen, methane and ethylene.',
    why: 'Fundamental flame-structure data for validating chemistry and transport models; indirect value for fire safety.' },
  { id: 'PSI-107', ac: 'SPICE', title: 'Smoke Point In Co-flow Experiment', sub: 'Fire Safety', plat: 'International Space Station (ISS)', hw: 'Microgravity Science Glovebox (MSG)',
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene', 'propane', 'propylene', 'propylene mixtures'], geom: 'Gas-jet nozzles of 0.41, 0.76 and 1.6 mm in a coflow duct',
    o2: null, p: CABIN, flow: T('PSI-107', 'flow', tbl('PSI-107', 'Spice.csv', 'Air Rate (cm/s)')),
    avail: 'run_table_partial', dil: [], varied: ['fuel', 'nozzle diameter', 'fuel flow rate', 'coflow air velocity'], sensors: ['still and video cameras', 'radiative heat loss'],
    sum: 'Gas-jet flames were lit in a flow duct in the station glovebox with a controlled coflow of air. Fuel flow was adjusted to find the smoke point, where the flame starts to emit soot. Flame lengths were recorded for several fuels and burner diameters. In total 526 flames were studied.',
    why: 'Improves understanding of soot formation, which the record links to designing safer spacecraft environments.' },
  { id: 'PSI-106', ac: 'SLICE', title: 'Structure and Liftoff In Combustion Experiment', sub: null, plat: 'International Space Station (ISS)', hw: null,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene', 'ethane', 'nitrogen-diluted mixtures'], geom: 'Exchangeable burner tubes in a fan-driven flow duct',
    o2: null, p: CABIN, flow: null,
    avail: 'run_log_only', dil: ['N2'], varied: ['fuel', 'nitrogen dilution', 'coflow velocity', 'burner diameter'], sensors: ['high-resolution still camera', 'flow and temperature sensors'],
    sum: 'Gas flames were lit by hand in a fan-driven flow duct and photographed under controlled coflow air. The study looked at how flames stabilize at their base and when they lift off, and how diluting the fuel with nitrogen affects soot and stability.',
    why: 'Insights into flame stability and soot that the record connects to fire safety and to better numerical models.' },
]

const MODELING = [
  { psi_id: 'PSI-62', title: 'Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography', parents: ['PSI-25', 'PSI-26'] },
  { psi_id: 'PSI-60', title: 'Computational and Experimental Analysis of SPICE Data Sets', parents: ['PSI-107'] },
  { psi_id: 'PSI-115', title: 'Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity', parents: ['PSI-102'] },
  { psi_id: 'PSI-117', title: 'Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis', parents: ['PSI-69'] },
  { psi_id: 'PSI-142', title: 'Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames', parents: ['PSI-69'] },
]

// SAFFIRE-II (PSI-99) is the one PSI record that measured the same solid-fuel samples in both
// microgravity and normal gravity (NASA-STD-6001B Test 1 is a 1-g standard; this table is the only
// place any PSI investigation pairs it against a microgravity result). Transcribed from
// PSI-99_Experimental table_SAFFIRE-2.csv (9 real burn samples; 2 rows are pre-test camera
// calibration and 4 are footnotes, excluded here). See context-limitations.md B3 for why this is
// shown as context only, not a general claim about how materials behave below 1 g.
const GRAVITY_COMPARISON = {
  'PSI-99': {
    caveat: 'NASA’s normal-gravity flammability screening (NASA-STD-6001B Test 1) is a 1-g test. SAFFIRE-II is the only PSI investigation that measured burn length for the same samples in both microgravity and normal gravity, so it is the only place in this app where that comparison is possible. Shown for context only — not a general rule for how any material behaves below 1 g.',
    source: 'PSI-99 experimental table (SAFFIRE-2.csv)',
    rows: [
      { sample: '2-1', material: 'Silicone, 0.27 mm', o2_percent: '~21.5%', microgravity_burn: '~0 cm (self-extinguished)', one_g_burn: 'Complete (29 cm)' },
      { sample: '2-2', material: 'Silicone, 0.61 mm', o2_percent: '~22.1%', microgravity_burn: '~0 cm (self-extinguished)', one_g_burn: '7.6 cm' },
      { sample: '2-3', material: 'Silicone, 1.03 mm', o2_percent: '~22.1%', microgravity_burn: '~0 cm (self-extinguished)', one_g_burn: '~0 cm (self-extinguished)' },
      { sample: '2-4', material: 'Silicone, 0.37 mm', o2_percent: '~22.1%', microgravity_burn: '~0 cm (self-extinguished)', one_g_burn: 'Complete (29 cm)' },
      { sample: '2-5', material: 'Cotton-fiberglass (SIBAL)', o2_percent: '~22.1%', microgravity_burn: '29 cm (full sample)', one_g_burn: 'Complete (29 cm)' },
      { sample: '2-6', material: 'Cotton-fiberglass (SIBAL)', o2_percent: '~22.1%', microgravity_burn: '29 cm (full sample)', one_g_burn: 'Complete (29 cm)' },
      { sample: '2-7', material: 'PMMA & Nomex', o2_percent: '~22.1%', microgravity_burn: 'PMMA 5 cm; Nomex not ignited', one_g_burn: 'PMMA consumed; Nomex not ignited' },
      { sample: '2-8', material: 'PMMA', o2_percent: '22.1% to 22.0%', microgravity_burn: '~10 cm of visible damage', one_g_burn: 'Complete (29 cm)' },
      { sample: '2-9', material: 'PMMA', o2_percent: '22.0% to 21.9%', microgravity_burn: '~10 cm of visible damage', one_g_burn: 'Complete (29 cm)' },
    ],
  },
}

// ---------- build investigations ----------
const byId = Object.fromEntries(I.map((x) => [x.id, x]))
const investigations = I.map((x) => {
  const r = rec(x.id), t = TABLES[x.id]
  if (r.accession !== x.id) throw new Error(`raw/${x.id}.json holds ${r.accession}`)
  if (!t) throw new Error(`${x.id}: no experimental table parsed`)
  const listed = (r.experimentalTable ?? []).map((e) => e.file_name).sort()
  if (JSON.stringify(listed) !== JSON.stringify([...t.files].sort())) throw new Error(`${x.id}: record lists tables ${listed.join(', ')} but tables.mjs read ${t.files.join(', ')}`)
  return {
    psi_id: x.id, acronym: x.ac, title: x.title, doi: r.doi, url: url(x.id), license: r.licenseIdentifier || 'not stated on the record',
    project_type: 'flight', platform: x.plat, hardware: x.hw, start_date: isoDate(r.investigationStartDate), end_date: isoDate(r.investigationEndDate), sub_research_area: x.sub,
    fire_safety_role: x.role, secondary_roles: x.sec, fuel_class: x.fuel, fuel_materials: x.mats, geometry: x.geom,
    conditions: { o2_percent: x.o2, pressure_kpa: x.p, flow_cm_s: x.flow, gravity_g: { values: [0], source: { type: 'psi_text', ref: `Project Type: ${r.projectType}` }, confidence: 'high' } },
    diluents: x.dil, variables_varied: x.varied, sensors: x.sensors,
    evidence: { n_runs: t.n_runs, table_files: t.files, data_availability: x.avail, raw_data_gb: Math.round(r.totalFileSize / 1e8) / 10 },
    summary: { text: x.sum, why_it_matters: x.why, generated_by: 'AI-drafted from the PSI record text', human_reviewed: false },
    n_publications: (r.publications ?? []).length, publications: (r.publications ?? []).map((p) => ({ title: clean(p.title), doi: p.doi || null })),
    related_modeling: MODELING.filter((m) => m.parents.includes(x.id)).map((m) => ({ psi_id: m.psi_id, title: m.title, url: url(m.psi_id) })),
    verified: { by: null, date: null },
    ...(GRAVITY_COMPARISON[x.id] ? { gravity_comparison: GRAVITY_COMPARISON[x.id] } : {}),
  }
})
for (const m of MODELING) m.doi = rec(m.psi_id).doi

// ---------- runs: points with BOTH oxygen and pressure, binned to 1% O2 and 5 kPa for display ----------
const binned = {}
for (const p of POINTS) {
  const o = Math.round(p.o2_percent), kpa = Math.round(p.pressure_kpa / 5) * 5, k = `${p.psi_id},${o},${kpa},${p.pressure_assumed ? 1 : 0}`
  binned[k] ??= { psi_id: p.psi_id, acronym: byId[p.psi_id].ac, fuel_class: byId[p.psi_id].fuel, o2_percent: o, pressure_kpa: kpa, pressure_assumed: p.pressure_assumed, flow_cm_s: null, n: 0 }
  binned[k].n++
}
const runs = Object.values(binned)

// ---------- environments ----------
const CH = 'https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/'
const st = (field, status, note, u) => ({ field, status, note, ...(u ? { url: u } : {}) })
const environments = {
  reference_spans: { o2_percent: 79.0, pressure_kpa: 71.7, flow_cm_s: 20.0, gravity_g: 1.0 },
  default_weights: { o2: 0.3, pressure: 0.2, flow: 0.1, gravity: 0.15, task: 0.25 },
  environments: [
    { id: 'iss', name: 'Space station cabin', o2_percent: 21, pressure_kpa: 101.3, gravity_g: 0, flow_cm_s: null, note: 'Sea-level-like atmosphere in microgravity.',
      sources: [st('o2_percent', 'verified', 'PSI-20 objectives list "14.7 psia, 21 % oxygen" as a NASA-considered atmosphere', url('PSI-20')), st('pressure_kpa', 'verified', '14.7 psia = 101.3 kPa (same source)', url('PSI-20')), st('gravity_g', 'reference', 'Orbital free fall')] },
    { id: 'moon_base', name: 'Lunar surface habitat', o2_percent: 30, pressure_kpa: 70.3, gravity_g: 0.166, flow_cm_s: null, note: 'The challenge statement expects at least 30% O2 at or below 10.2 psi (70.3 kPa). The boundary values are used here.',
      sources: [st('o2_percent', 'from_challenge_statement', 'at least 30% O2', CH), st('pressure_kpa', 'from_challenge_statement', 'at or below 10.2 psi', CH), st('gravity_g', 'reference', 'Lunar surface gravity, about one sixth of Earth')] },
    { id: 'rover', name: 'Pressurized lunar rover', o2_percent: 30, pressure_kpa: 70.3, gravity_g: 0.166, flow_cm_s: null, note: 'Same atmosphere expectation as the lunar habitat in the challenge statement.',
      sources: [st('o2_percent', 'from_challenge_statement', 'at least 30% O2', CH), st('pressure_kpa', 'from_challenge_statement', 'at or below 10.2 psi', CH), st('gravity_g', 'reference', 'Lunar surface gravity')] },
    { id: 'mars_base', name: 'Mars surface habitat', o2_percent: 30, pressure_kpa: 70.3, gravity_g: 0.38, flow_cm_s: null, note: 'Atmosphere is our assumption (same as the lunar habitat). Change it with the sliders.',
      sources: [st('o2_percent', 'nominal_assumption', 'Assumed equal to the lunar habitat'), st('pressure_kpa', 'nominal_assumption', 'Assumed equal to the lunar habitat'), st('gravity_g', 'reference', 'Mars surface gravity, about 0.38 of Earth')] },
    { id: 'spacesuit', name: 'Spacesuit (spacewalk)', o2_percent: 100, pressure_kpa: 29.6, gravity_g: 0, flow_cm_s: null, note: '100% O2 per the challenge statement. NASA 2022 chamber tests of simulated EVAs instead used 85% O2 at the same 4.3 psi. Gravity is set to orbital free fall; a surface spacewalk would differ.',
      sources: [st('o2_percent', 'from_challenge_statement', '100% O2; NASA chamber tests of simulated EVAs used 85% O2 at 4.3 psi', 'https://ntrs.nasa.gov/api/citations/20230007403/downloads/AsMA%202023%20-%20Abercromby%20-%20Habitability%20and%20Lessons%20Learned%20v1.pdf'), st('pressure_kpa', 'from_challenge_statement', '4.3 psi', CH), st('gravity_g', 'nominal_assumption', 'Orbital spacewalk assumed')] },
    { id: 'exploration_atm', name: 'NASA Exploration Atmosphere', o2_percent: 34, pressure_kpa: 56.5, gravity_g: 0.166, flow_cm_s: null, note: 'NASA’s proposed Exploration Atmosphere for Artemis habitats: 8.2 psia, 34% O2. Not yet finalized; shown here at lunar surface gravity.',
      sources: [st('o2_percent', 'verified', 'NASA Exploration Atmosphere, 34% O2 (revised from 32%)', 'https://ntrs.nasa.gov/api/citations/20220011152/downloads/Exploration%20Atmosphers%20OAF%2020220805.pdf'), st('pressure_kpa', 'verified', '8.2 psia = 56.5 kPa', 'https://ntrs.nasa.gov/api/citations/20220011152/downloads/Exploration%20Atmosphers%20OAF%2020220805.pdf'), st('gravity_g', 'reference', 'Lunar surface gravity, about one sixth of Earth')] },
    { id: 'exploration_10_2psi', name: 'NASA Exploration Atmosphere (10.2 psia)', o2_percent: 26.5, pressure_kpa: 70.3, gravity_g: 0.166, flow_cm_s: null, note: 'A second point from the same NASA table: 10.2 psia, 26.5% O2. Artemis habitat and suit atmospheres are not finalized.',
      sources: [st('o2_percent', 'verified', '26.5% O2 at 10.2 psia, from the same NASA Exploration Atmosphere table', 'https://ntrs.nasa.gov/api/citations/20220011152/downloads/Exploration%20Atmosphers%20OAF%2020220805.pdf'), st('pressure_kpa', 'verified', '10.2 psia = 70.3 kPa', 'https://ntrs.nasa.gov/api/citations/20220011152/downloads/Exploration%20Atmosphers%20OAF%2020220805.pdf'), st('gravity_g', 'reference', 'Lunar surface gravity, about one sixth of Earth')] },
    { id: 'earth', name: 'Earth (reference)', o2_percent: 21, pressure_kpa: 101.3, gravity_g: 1, flow_cm_s: null, note: 'Sea-level air at normal gravity, for comparison.',
      sources: [st('o2_percent', 'reference', 'Sea-level air'), st('pressure_kpa', 'reference', '14.7 psi'), st('gravity_g', 'reference', '1 g')] },
  ],
  tasks: [
    { id: 'prevent', name: 'Material flammability and fire prevention', role: 'prevention', preferred_fuel_classes: ['solid'] },
    { id: 'detect', name: 'Smoke and fire detection', role: 'detection', preferred_fuel_classes: ['aerosol', 'solid'] },
    { id: 'suppress', name: 'Fire suppression and extinguishment', role: 'suppression', preferred_fuel_classes: ['liquid_droplet', 'solid'] },
  ],
}

// ---------- gaps and insights (computed) ----------
const FUEL_LABEL = { solid: 'solid-fuel', liquid_droplet: 'liquid-droplet', gas: 'gas-fuel', aerosol: 'smoke and aerosol' }
const maxO2 = (cls) => investigations.filter((i) => (!cls || i.fuel_class === cls) && i.conditions.o2_percent).reduce((b, i) => (!b || i.conditions.o2_percent.max > b.conditions.o2_percent.max ? i : b), null)
const recordedP = investigations.filter((i) => i.conditions.pressure_kpa && i.conditions.pressure_kpa.source.type !== 'assumed_platform')
const sumObj = (o) => Object.values(o).reduce((a, b) => a + b, 0)
// Run-level counts from the full-resolution points (not the display bins), keyed by PSI ID in sorted order.
const countBy = (pred) => { const c = {}; for (const p of POINTS) if (pred(p)) c[p.psi_id] = (c[p.psi_id] || 0) + 1; return Object.fromEntries(Object.entries(c).sort(([a], [b]) => a.localeCompare(b))) }
const RUN_STATS = {
  total_points: POINTS.length,
  near: Object.fromEntries(environments.environments.map((e) => [e.id, countBy((p) => Math.abs(p.o2_percent - e.o2_percent) <= 5 && Math.abs(p.pressure_kpa - e.pressure_kpa) <= 10)])),
  o2_ge_30: countBy((p) => p.o2_percent >= 30),
  o2_ge_30_and_p_le_75_recorded: countBy((p) => p.o2_percent >= 30 && p.pressure_kpa <= 75 && !p.pressure_assumed),
}
const gaps =environments.environments.map((e) => {
  const g = []
  const sameG = investigations.filter((i) => i.conditions.gravity_g.values.some((v) => Math.abs(v - e.gravity_g) <= 0.05))
  if (sameG.length === 0) g.push({ id: 'partial_gravity', severity: 'high', text: `None of the ${investigations.length} flight investigations ran at ${e.gravity_g} g. All of them ran in microgravity, so there is no partial-gravity evidence here.`, computed_from: { metric: `investigations with a gravity level within 0.05 g of ${e.gravity_g}`, value: 0 }, sources: investigations.map((i) => i.psi_id) })
  const ms = maxO2('solid')
  if (e.o2_percent > ms.conditions.o2_percent.max) g.push({ id: 'o2_solids', severity: 'high', text: `The highest oxygen level in any solid-fuel data table is ${ms.conditions.o2_percent.max}% (${ms.acronym}). This environment has ${e.o2_percent}%, which is ${(e.o2_percent - ms.conditions.o2_percent.max).toFixed(1)} points higher.`, computed_from: { metric: 'max tabulated O2 % among solid-fuel investigations', value: ms.conditions.o2_percent.max }, sources: investigations.filter((i) => i.fuel_class === 'solid' && i.conditions.o2_percent).map((i) => i.psi_id) })
  const ma = maxO2(null)
  if (e.o2_percent > ma.conditions.o2_percent.max) g.push({ id: 'o2_any', severity: 'high', text: `No investigation of any fuel type has a tabulated oxygen level as high as ${e.o2_percent}%. The highest is ${ma.conditions.o2_percent.max}% (${investigations.filter((i) => i.conditions.o2_percent && i.conditions.o2_percent.max === ma.conditions.o2_percent.max).map((i) => i.acronym).join(', ')}, gas fuels).`, computed_from: { metric: 'max tabulated O2 % across all investigations', value: ma.conditions.o2_percent.max }, sources: [ma.psi_id] })
  const solidsRecP = recordedP.filter((i) => i.fuel_class === 'solid')
  if (e.pressure_kpa < 95) {
    const covering = recordedP.filter((i) => i.conditions.pressure_kpa.min <= e.pressure_kpa && i.conditions.pressure_kpa.max >= e.pressure_kpa)
    g.push({ id: 'low_pressure', severity: solidsRecP.length === 0 ? 'high' : 'medium', text: `${covering.length} investigations have a recorded pressure range that includes ${e.pressure_kpa} kPa (${covering.map((i) => i.acronym).join(', ') || 'none'}). ${solidsRecP.length === 0 ? 'None of them burned solid fuels: no solid-fuel table records pressure at all.' : ''}`, computed_from: { metric: `investigations whose recorded pressure range includes ${e.pressure_kpa} kPa`, value: covering.length }, sources: covering.map((i) => i.psi_id) })
  }
  const near = RUN_STATS.near[e.id] || {}
  const nearTotal = sumObj(near)
  const classes = [...new Set(Object.keys(near).map((id) => FUEL_LABEL[byId[id].fuel]))]
  g.push({ id: 'combined', severity: nearTotal === 0 ? 'high' : 'info', text: nearTotal === 0 ? `Of ${RUN_STATS.total_points} runs with both oxygen and pressure, none is within 5 oxygen points and 10 kPa of this environment.` : `Of ${RUN_STATS.total_points} runs with both oxygen and pressure, ${nearTotal} are within 5 oxygen points and 10 kPa of this environment (${Object.entries(near).map(([id, n]) => `${byId[id].ac}: ${n}`).join(', ')}). Fuel types: ${classes.join(', ')}.`, computed_from: { metric: 'runs within +/-5 O2 points and +/-10 kPa', value: nearTotal }, sources: Object.keys(near) })
  return { environment_id: e.id, gaps: g }
})

const hiLow = RUN_STATS.o2_ge_30_and_p_le_75_recorded
const insights = {
  snapshot_date: SNAPSHOT_DATE,
  n_investigations: investigations.length,
  n_table_rows: investigations.reduce((s, i) => s + i.evidence.n_runs, 0),
  n_run_points: RUN_STATS.total_points,
  n_publications_listed: investigations.reduce((s, i) => s + i.n_publications, 0),
  n_related_modeling: MODELING.length,
  max_o2_solid: { value: maxO2('solid').conditions.o2_percent.max, psi_id: maxO2('solid').psi_id, acronym: maxO2('solid').acronym },
  max_o2_any: { value: maxO2(null).conditions.o2_percent.max, psi_id: maxO2(null).psi_id },
  min_recorded_pressure: recordedP.reduce((b, i) => (!b || i.conditions.pressure_kpa.min < b.value ? { value: i.conditions.pressure_kpa.min, psi_id: i.psi_id, acronym: i.acronym } : b), null),
  solid_investigations_with_recorded_pressure: recordedP.filter((i) => i.fuel_class === 'solid').length,
  runs_o2_ge_30: { total: sumObj(RUN_STATS.o2_ge_30), by_investigation: RUN_STATS.o2_ge_30 },
  runs_o2_ge_30_and_p_le_75: { total: sumObj(hiLow), by_investigation: hiLow, solid: 0 },
  by_role: Object.fromEntries(['prevention', 'detection', 'suppression', 'fundamental'].map((r) => [r, investigations.filter((i) => i.fire_safety_role === r).length])),
  by_fuel_class: Object.fromEntries(['solid', 'liquid_droplet', 'gas', 'aerosol'].map((r) => [r, investigations.filter((i) => i.fuel_class === r).length])),
  by_data_availability: investigations.reduce((o, i) => ((o[i.evidence.data_availability] = (o[i.evidence.data_availability] || 0) + 1), o), {}),
}

const sources = {
  psi: [...investigations.map((i) => ({ psi_id: i.psi_id, acronym: i.acronym, title: i.title, doi: i.doi, url: i.url, license: i.license, used_as: 'ranked investigation' })),
    ...MODELING.map((m) => ({ psi_id: m.psi_id, acronym: null, title: m.title, doi: m.doi, url: url(m.psi_id), license: 'CC0-1.0', used_as: 'related modeling study' }))],
  other: [
    { title: 'PSI Data Repository: Combustion Science', url: 'https://psi.nasa.gov/physci/repo/search?q=combustion' },
    { title: 'NASA Combustion Science', url: 'https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/' },
    { title: "A Researcher's Guide to ISS Combustion Science", url: 'https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/' },
    { title: 'Flame in Freefall challenge statement', url: CH },
  ],
}

const earth = {
  spinoffs: [
    { title: "Fireman's Air Tanks", era: '1970s', blurb: 'Spacesuit technology adapted for firefighter breathing equipment.', url: 'https://spinoff.nasa.gov/node/9582' },
    { title: 'Fire Detector', era: '1970s', blurb: 'A shuttle-era smoke detector that tells smoke from dust, which cuts nuisance alarms.', url: 'https://spinoff.nasa.gov/node/9407' },
    { title: 'New Technology for the Fire Attire', era: '1980s', blurb: 'Spacesuit technology applied to firefighter clothing.', url: 'https://spinoff.nasa.gov/node/9918' },
  ],
  history: [
    { title: 'Apollo 1', blurb: 'Fire during a pre-launch test; investigation and lessons learned.', url: 'https://sma.nasa.gov/sma-disciplines/accllp/apollo-1' },
    { title: 'Apollo 13', blurb: 'Oxygen tank explosion; investigation and lessons learned.', url: 'https://sma.nasa.gov/sma-disciplines/accllp/apollo-13' },
    { title: 'Fire aboard space station Mir', blurb: 'The 1997 fire caused by an oxygen generator failure.', url: 'https://www.nasa.gov/history/25-years-ago-fire-aboard-space-station-mir/' },
  ],
}

// ---------- validate ----------
const ROLES = ['prevention', 'detection', 'suppression', 'fundamental'], FUELS = ['solid', 'liquid_droplet', 'gas', 'aerosol']
for (const i of investigations) {
  if (!ROLES.includes(i.fire_safety_role) || !FUELS.includes(i.fuel_class)) throw new Error('enum ' + i.psi_id)
  if (!i.doi || !i.url) throw new Error('doi ' + i.psi_id)
  for (const k of ['o2_percent', 'pressure_kpa', 'flow_cm_s']) {
    const c = i.conditions[k]
    if (!c) continue
    if (!c.source?.ref || !c.confidence) throw new Error(`provenance ${i.psi_id} ${k}`)
    if (c.min !== null && c.max !== null && c.min > c.max) throw new Error(`min>max ${i.psi_id} ${k}`)
    if (k === 'o2_percent' && (c.max > 100 || (c.min ?? 0) < 0)) throw new Error('o2 range ' + i.psi_id)
    if (k === 'pressure_kpa' && (c.max > 600 || c.min < 5)) throw new Error('pressure range ' + i.psi_id)
  }
  const words = (s) => s.trim().split(/\s+/).length
  if (words(i.summary.text) > 80) throw new Error(`summary too long ${i.psi_id}: ${words(i.summary.text)}`)
  if (words(i.summary.why_it_matters) > 35) throw new Error(`why too long ${i.psi_id}: ${words(i.summary.why_it_matters)}`)
  if (i.gravity_comparison && i.gravity_comparison.rows.length !== i.evidence.n_runs) throw new Error(`gravity_comparison has ${i.gravity_comparison.rows.length} rows, table has ${i.evidence.n_runs} samples (${i.psi_id})`)
  // Text-derived values must quote the PSI record verbatim.
  for (const c of Object.values(i.conditions)) {
    if (c?.source?.type !== 'psi_text' || c.source.ref.startsWith('Project Type:')) continue
    const q = clean(c.source.ref.replace(/^"|"$/g, ''))
    if (!recordText(i.psi_id).includes(q)) throw new Error(`${i.psi_id}: quote not found in record text: ${q}`)
  }
}
for (const r of runs) if (!byId[r.psi_id]) throw new Error('run without investigation')

// ---------- regression check against expected.json ----------
const range = (c) => (c && c.source.type === 'table_column' ? [c.min, c.max] : null)
const actual = {
  investigations: Object.fromEntries(investigations.map((i) => [i.psi_id, { doi: i.doi, start: i.start_date, end: i.end_date, license: i.license === 'not stated on the record' ? null : i.license, raw_data_gb: i.evidence.raw_data_gb, n_publications: i.n_publications, n_runs: i.evidence.n_runs, table_files: i.evidence.table_files, o2_percent: range(i.conditions.o2_percent), pressure_kpa: range(i.conditions.pressure_kpa), flow_cm_s: range(i.conditions.flow_cm_s) }])),
  run_stats: RUN_STATS,
  bins: Object.fromEntries(runs.map((r) => [`${r.psi_id},${r.o2_percent},${r.pressure_kpa},${r.pressure_assumed ? 1 : 0}`, r.n])),
}
const EXPECTED_PATH = join(HERE, 'expected.json')
const expected = JSON.parse(readFileSync(EXPECTED_PATH, 'utf8'))
const diffs = []
const cmp = (a, e, path) => {
  if (a && e && typeof a === 'object' && typeof e === 'object' && !Array.isArray(a) && !Array.isArray(e)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(e)])) cmp(a[k], e[k], `${path}.${k}`)
  } else if (JSON.stringify(a) !== JSON.stringify(e)) diffs.push(`${path}: expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`)
}
for (const k of ['investigations', 'run_stats', 'bins']) cmp(actual[k], expected[k], k)
if (diffs.length && process.argv.includes('--accept')) {
  writeFileSync(EXPECTED_PATH, JSON.stringify({ note: expected.note, ...actual }, null, 1) + '\n')
  console.log(`expected.json updated (${diffs.length} accepted changes):\n  ${diffs.join('\n  ')}`)
} else if (diffs.length) {
  throw new Error(`${diffs.length} computed values differ from pipeline/expected.json:\n  ${diffs.join('\n  ')}\nIf intended, re-run with --accept and log why in docs/DATA_CLEANING_LOG.md.`)
}

const w = (f, o) => writeFileSync(join(OUT, f), JSON.stringify(o, null, 1))
w('investigations.json', investigations); w('runs.json', runs); w('environments.json', environments); w('gaps.json', gaps); w('insights.json', insights); w('sources.json', sources); w('earth_applications.json', earth)
console.log(`OK: ${investigations.length} investigations, ${runs.length} bins (${RUN_STATS.total_points} runs), ${gaps.length} environments`)
console.log(JSON.stringify(insights, null, 1))
gaps.filter((g) => g.environment_id === 'moon_base').forEach((g) => g.gaps.forEach((x) => console.log('-', x.severity, x.text)))
