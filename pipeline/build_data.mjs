// Builds app/public/data/*.json from the PSI snapshot below.
// SNAPSHOT: values read from psi.nasa.gov on 2026-11-14 (record JSON + "Experimental table" CSVs),
// parsed in a browser session because this build machine cannot reach psi.nasa.gov.
// See docs/DATA_CLEANING_LOG.md. Re-run: node pipeline/build_data.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'public', 'data')
mkdirSync(OUT, { recursive: true })
const SNAPSHOT_DATE = '2026-11-14'
const url = (id) => `https://psi.nasa.gov/physci/repo/data/investigations/${id}`
const tbl = (id, f, col) => ({ type: 'table_column', ref: `${id}_Experimental table_${f} :: ${col}` })
const txt = (q) => ({ type: 'psi_text', ref: q })
const CABIN = { min: 101.3, max: 101.3, unit: 'kPa', source: { type: 'assumed_platform', ref: 'Ran in cabin or module air (glovebox or Cygnus); pressure is not in the experimental table, so about 1 atm is assumed' }, confidence: 'low' }
const R = (min, max, unit, source, confidence = 'high') => ({ min, max, unit, source, confidence })

// id, acronym, title, doi, sub, platform, hardware, start, end, license, gb, pubs, role, secondary, fuel, materials, geometry,
// o2, pressure, flow, n_runs, files, availability, diluents, varied, sensors, summary, why
const I = [
  { id: 'PSI-25', ac: 'BASS-II', title: 'Burning and Suppression of Solids - II', doi: '10.60555/4qc4-de67', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Microgravity Science Glovebox (MSG)', start: '2010-01-01', end: '2022-12-31', lic: 'CC0-1.0', gb: 274.6, pubs: 17,
    role: 'prevention', sec: ['suppression'], fuel: 'solid', mats: ['PMMA films and sheets of several thicknesses'], geom: 'Samples mounted in a small wind tunnel; opposed and concurrent flow',
    o2: R(13.6, 22.2, '%', tbl('PSI-25', 'BASS-II.csv', 'Calibrated initial O2 % by vol')), p: CABIN, flow: R(null, 40, 'cm/s', txt('"a small wind tunnel which could impose airflow speeds up to 40 cm/s"'), 'medium'),
    n: 129, files: ['BASS-II.csv'], avail: 'run_table_with_conditions', dil: ['N2'], varied: ['airflow speed', 'oxygen concentration', 'flow direction'], sensors: ['imaging', 'radiometer', 'O2, CO2 and CO readings'],
    sum: 'Solid fuel samples were burned in a small wind tunnel inside the station glovebox. Airflow speed and oxygen concentration were the main variables, with oxygen lowered below 21% by adding nitrogen. The team recorded flame appearance, growth and spread rate in opposed and concurrent flow, and studied ignition and extinction limits.',
    why: 'Aims to link the normal-gravity NASA-STD-6001 Test 1 method to actual material flammability in microgravity, to help select safer materials.' },
  { id: 'PSI-26', ac: 'BASS', title: 'Burning and Suppression of Solids', doi: '10.60555/58h4-dy80', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Microgravity Science Glovebox', start: '2009-10-01', end: '2013-06-30', lic: 'CC0-1.0', gb: 163.6, pubs: 10,
    role: 'prevention', sec: ['suppression'], fuel: 'solid', mats: ['cotton-fiberglass fabric (SIBAL)', 'Nomex', 'Ultem', 'PMMA spheres'], geom: 'Flat fabric, spheres and cylinders in a 76 mm x 76 mm flow duct',
    o2: null, p: CABIN, flow: R(null, 40, 'cm/s', txt('"airflow speeds reaching as high as 40 cm/s"'), 'medium'),
    n: 122, files: ['BASS.csv'], avail: 'run_log_only', dil: [], varied: ['airflow speed', 'flow direction', 'material', 'geometry'], sensors: ['imaging (top and edge views)'],
    sum: 'Fabric, plastic and other solid samples were ignited in a small flow duct inside the station glovebox, with a fan setting the airflow in the opposed or concurrent direction. Flame size, shape, color, spread rate and quenching were observed. A second objective was to assess an inert gaseous extinguishing agent.',
    why: 'Spacecraft materials are selected with a 1-g test (NASA-STD-6001 Test 1); BASS examines how that relates to burning in microgravity.' },
  { id: 'PSI-98', ac: 'SAFFIRE-I', title: 'Spacecraft Fire Safety Experiment-I', doi: '10.60555/0t15-1z43', sub: 'Spacecraft Fire, Smoke Distribution', plat: 'International Space Station (ISS)', hw: 'Saffire 1 enclosure in Cygnus', start: '2001-03-02', end: '2008-02-28', lic: 'CC0-1.0', gb: 12.3, pubs: 6,
    role: 'prevention', sec: [], fuel: 'solid', mats: ['cotton-fiberglass fabric (SIBAL)'], geom: 'One large sample, about 0.94 m long and 0.4 m wide, in a flow duct',
    o2: R(21.5, 21.7, '%', tbl('PSI-98', 'SAFFIRE-1.csv', 'Percent O2')), p: CABIN, flow: R(20, 20, 'cm/s', tbl('PSI-98', 'SAFFIRE-1.csv', 'Air Flow (cm/s)')),
    n: 2, files: ['SAFFIRE-1.csv'], avail: 'run_table_with_conditions', dil: [], varied: ['flow direction'], sensors: ['two cameras', 'thermocouples', 'radiometers'],
    sum: 'A large piece of cotton-fiberglass fabric, about 0.94 meters long and 0.4 meters wide, was burned inside a Cygnus cargo vehicle after it left the station. Air was drawn through a flow duct at 20 cm/s. Cameras, thermocouples and radiometers recorded how the flame grew.',
    why: 'Tests how rapidly a large-scale fire grows in low gravity and compares low-g flammability limits with the normal-gravity screening test.' },
  { id: 'PSI-99', ac: 'SAFFIRE-II', title: 'Spacecraft Fire Experiment-II', doi: '10.60555/2chp-m469', sub: 'Surface Combustion', plat: 'Cygnus Spacecraft', hw: 'Cygnus Pressurized Cargo Module, SAFFIRE', start: '2016-09-30', end: '2017-04-01', lic: 'CC0-1.0', gb: 16.9, pubs: 7,
    role: 'prevention', sec: [], fuel: 'solid', mats: ['silicone', 'cotton-fiberglass fabric (SIBAL)', 'PMMA', 'PMMA with Nomex'], geom: '9 samples, each 5 cm x 29 cm, on one sample card',
    o2: R(21.5, 22.1, '%', tbl('PSI-99', 'SAFFIRE-2.csv', 'Percent O2 (Note 1)')), p: CABIN, flow: R(20, 30, 'cm/s', txt('"conducted at an air flow velocity of either 20 or 30 cm/s"'), 'medium'),
    n: 9, files: ['SAFFIRE-2.csv'], avail: 'run_table_with_conditions', dil: [], varied: ['material', 'flow direction', 'airflow speed'], sensors: ['two cameras', 'thermocouples', 'radiometers', 'pressure, CO2 and O2 sensors'],
    sum: 'Nine samples, each 5 cm by 29 cm, were burned on a Cygnus cargo vehicle after it left the station. Materials included silicone, cotton-fiberglass fabric and PMMA. Airflow was 20 or 30 cm/s, concurrent or opposed. The data table lists burn lengths in microgravity next to normal-gravity results.',
    why: 'Compares low-gravity flammability limits with those from NASA\'s normal-gravity material screening test, across several materials.' },
  { id: 'PSI-100', ac: 'SAFFIRE-III', title: 'Spacecraft Fire Experiment-III', doi: '10.60555/040q-4h36', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Saffire III enclosure in Cygnus', start: '2017-04-18', end: null, lic: 'CC0-1.0', gb: 35.2, pubs: 3,
    role: 'prevention', sec: [], fuel: 'solid', mats: ['cotton-fiberglass fabric (SIBAL)'], geom: 'Large sample, 94 cm x 40.6 cm',
    o2: null, p: CABIN, flow: R(30, 30, 'cm/s', tbl('PSI-100', 'SAFFIRE-3.csv', 'Air Flow')),
    n: 2, files: ['SAFFIRE-3.csv'], avail: 'run_table_partial', dil: [], varied: ['flow direction'], sensors: ['two cameras', 'thermocouples', 'radiometers', 'pressure, CO2 and O2 sensors', 'anemometers'],
    sum: 'A follow-on to Saffire-I using the same cotton-fiberglass fabric on a Cygnus cargo vehicle, but at a flow velocity of 30 cm/s compared with 20 cm/s. The flow was concurrent or opposed. Cameras, thermocouples, radiometers and gas sensors recorded the burn.',
    why: 'Extends the large-scale fire-growth test to a higher airflow, for comparison with the normal-gravity flammability screening test.' },
  { id: 'PSI-102', ac: 'SAME', title: 'Smoke and Aerosol Measurement Experiment', doi: '10.60555/gd4k-8h62', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Comparative Soot Diagnostic hardware', start: '2001-03-02', end: '2008-02-28', lic: 'CC0-1.0', gb: 0.7, pubs: 16,
    role: 'detection', sec: [], fuel: 'aerosol', mats: ['Teflon', 'Kapton', 'silicone rubber', 'lampwick', 'dibutyl phthalate'], geom: 'Overheated samples in the glovebox',
    o2: null, p: CABIN, flow: R(5, 10, 'cm/s', tbl('PSI-102', 'SAME.csv', 'Air Flow (cm/s)')),
    n: 8, files: ['SAME.csv'], avail: 'run_table_partial', dil: [], varied: ['material', 'airflow', 'aging duration'], sensors: ['two smoke detectors', 'thermophoretic soot samplers', 'video cameras'],
    sum: 'Smoke from overheated spacecraft materials was produced in the station glovebox and sampled. Two smoke detectors were tested against it, and collected particles were later examined with an electron microscope to measure particle dimensions. Sample mass loss was also measured.',
    why: 'Provides data on how sensitive existing smoke detectors are to reduced-gravity smoke, toward an advanced fire detector for long missions.' },
  { id: 'PSI-101', ac: 'SAME-R', title: 'Smoke Aerosol Measurement Experiment-Reflight', doi: '10.60555/2np7-jv14', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Comparative Soot Diagnostic hardware', start: '2010-07-01', end: '2010-09-30', lic: 'CC0-1.0', gb: 6.3, pubs: 6,
    role: 'detection', sec: [], fuel: 'aerosol', mats: ['Kapton', 'silicone', 'lampwick', 'Teflon', 'Pyrell foam'], geom: 'Overheated samples in the glovebox',
    o2: null, p: CABIN, flow: R(0, 8.1, 'cm/s', tbl('PSI-101', 'SAME-R.csv', 'Inlet velocity (cm/s)')),
    n: 109, files: ['SAME-R.csv'], avail: 'run_table_partial', dil: [], varied: ['material', 'heating temperature', 'inlet velocity', 'aging'], sensors: ['smoke detector instruments', 'thermal precipitator'],
    sum: 'A reflight of SAME on the same hardware with changes: a new fire-retardant foam sample, broader test conditions including higher heating temperatures and no flow during heating, and a new instrument. The goal was to quantify smoke particle sizes in low gravity. 66 test points were completed.',
    why: 'Together with SAME, its results can lead to an advanced fire detector for spacecraft on long-duration missions.' },
  { id: 'PSI-47', ac: 'DAFT / DAFT-2', title: 'Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2', doi: '10.60555/ztgj-d202', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'TSI P-Trak', start: '2003-03-01', end: '2009-06-01', lic: 'CC0-1.0', gb: 0, pubs: 2,
    role: 'detection', sec: [], fuel: 'aerosol', mats: ['Arizona Road Dust (test aerosol)'], geom: 'Aerosol held in 15-liter Mylar bags',
    o2: null, p: CABIN, flow: null,
    n: 2, files: ['DAFT.csv'], avail: 'run_log_only', dil: [], varied: ['instrument', 'sampled location'], sensors: ['modified P-Trak particle counter', 'DustTrak'],
    sum: 'A risk-reduction test for SAME. A commercial particle counter, the P-Trak, relies on gravity, so it was modified for microgravity and checked on orbit against a second instrument using a standard dust aerosol held in 15-liter bags. No combustion took place.',
    why: 'Longer missions on larger vessels need fire detection with better reliability and sensitivity; this checked a key smoke-measurement instrument.' },
  { id: 'PSI-69', ac: 'FLEX', title: 'Flame Extinguishment Experiment', doi: '10.60555/mbq8-0451', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), Multi-user Droplet Combustion Apparatus', start: '2007-08-01', end: '2016-07-31', lic: 'CC0-1.0', gb: 923.8, pubs: 51,
    role: 'suppression', sec: [], fuel: 'liquid_droplet', mats: ['methanol', 'heptane'], geom: 'Single droplets, about 1 to 5 mm',
    o2: R(12, 34, '%', tbl('PSI-69', 'FLEX.csv', 'O initial ambient composition; mole fraction')), p: R(70.2, 309.3, 'kPa', tbl('PSI-69', 'FLEX.csv', 'Ambient pressure; mmHg')), flow: null,
    n: 274, files: ['FLEX.csv'], avail: 'run_table_with_conditions', dil: ['N2', 'CO2', 'He'], varied: ['oxygen mole fraction', 'pressure', 'diluent', 'droplet size', 'fuel'], sensors: ['droplet and flame imaging'],
    sum: 'Single droplets of liquid fuel were ignited in a sealed chamber while oxygen level, pressure and diluent gas were changed. The aim was to map flammability limits in microgravity, including the limiting oxygen index as a function of pressure, and to measure how well gaseous suppressants such as CO2 and He work.',
    why: 'Directly supports fire-suppression choices for spacecraft, where traditional suppression methods may be ineffective.' },
  { id: 'PSI-68', ac: 'FLEX-2', title: 'Flame Extinguishment Experiment - 2', doi: '10.60555/byp8-h018', sub: 'Spacecraft Fire Safety', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), Multi-user Droplet Combustion Apparatus (MDCA)', start: '2016-08-12', end: '2019-09-30', lic: 'CC0-1.0', gb: 1224.8, pubs: 48,
    role: 'fundamental', sec: ['suppression'], fuel: 'liquid_droplet', mats: ['iso-octane', 'n-octane', 'heptane', 'decane', 'ethanol', 'propanol-glycerol', 'heptane-iso-octane'], geom: 'Droplets, 1.5 to 5 mm initial diameter',
    o2: R(17, 30, '%', tbl('PSI-68', 'Flex2.csv', 'Oxygen Mole Fraction')), p: R(50.7, 304.0, 'kPa', tbl('PSI-68', 'Flex2.csv', 'Ambient Pressure (atm)')), flow: R(0.1, 5, 'cm/s', tbl('PSI-68', 'Flex2.csv', 'Flow Velocity (cm/s)')),
    n: 8, files: ['Flex2.csv'], avail: 'run_table_with_conditions', dil: ['N2', 'He'], varied: ['fuel', 'oxygen mole fraction', 'pressure', 'flow velocity', 'droplet size'], sensors: ['droplet and flame imaging'],
    sum: 'Extends FLEX to more fuels, including two-component droplets, and to a wider range of conditions. The chamber atmosphere was varied in pressure and oxygen concentration with a diluent gas making up the balance. The results are benchmark data for validating simulations and new models of droplet burning and extinction.',
    why: 'Adds flame-extinction data for more fuels and atmospheres, though its stated focus is engine-relevant combustion more than spacecraft fire safety.' },
  { id: 'PSI-39', ac: 'CFI', title: 'Cool Flames Investigation', doi: '10.60555/m6pj-a914', sub: 'Droplets', plat: 'International Space Station (ISS)', hw: 'Multi-User Droplet Combustion Apparatus (MDCA), Combustion Integrated Rack (CIR)', start: '2020-10-01', end: '2021-10-20', lic: 'CC0-1.0', gb: 718.9, pubs: 7,
    role: 'fundamental', sec: [], fuel: 'liquid_droplet', mats: ['n-dodecane', 'n-dodecane / iso-dodecane mixtures'], geom: 'Droplets suspended on needles or fibers',
    o2: R(17, 21, '%', tbl('PSI-39', 'CFI.csv', 'Oxygen')), p: R(50.7, 506.6, 'kPa', tbl('PSI-39', 'CFI.csv', 'Pressure')), flow: null,
    n: 87, files: ['CFI.csv'], avail: 'run_table_with_conditions', dil: ['N2', 'He'], varied: ['pressure', 'helium dilution', 'fuel mixture', 'droplet size'], sensors: ['black-and-white camera for droplet size'],
    sum: 'Fuel droplets were burned in a sealed chamber to study cool flames, a low-temperature burning mode. The tests varied pressure and helium dilution and looked at how droplet size and pressure relate to flame extinction, using n-dodecane and its mixtures.',
    why: 'Cool flames matter for understanding ignition of practical fuels; a flame that keeps burning in a cool mode is also relevant to knowing when a fire is truly out.' },
  { id: 'PSI-20', ac: 'ACME BRE', title: 'Advanced Combustion via Microgravity Experiments - Burning Rate Emulator', doi: '10.60555/vb93-3y72', sub: 'Flames of Gaseous Fuels', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME', start: '2010-01-01', end: '2025-02-08', lic: 'CC0-1.0', gb: 2035.6, pubs: 16,
    role: 'prevention', sec: [], fuel: 'gas', mats: ['ethylene (C2H4)', 'methane (CH4)', 'nitrogen-diluted mixtures'], geom: 'Porous circular burners, 25 and 50 mm diameter',
    o2: R(21, 40, '%', tbl('PSI-20', 'ACME BRE.csv', 'Oxygen Conc (percent)')), p: null, flow: null,
    n: 18, files: ['ACME BRE.csv'], avail: 'run_table_partial', dil: ['N2'], varied: ['oxygen concentration', 'pressure (not listed in the summary table)', 'burner size', 'fuel'], sensors: ['burner surface temperature and heat flux'],
    sum: 'A gas burner was used to emulate the burning of solid and liquid materials in still microgravity air. Gas flames on porous circular burners of 25 and 50 mm diameter were observed while oxygen concentration and pressure were varied, to build a flammability map in terms of material properties.',
    why: 'Burning matching materials such as PMMA and Nylon was observed without air flow, although stopping ventilation is an established step in fighting spacecraft fires.' },
  { id: 'PSI-10', ac: 'ACME Flame Design', title: 'Advanced Combustion via Microgravity Experiments / Flame Design', doi: '10.60555/w4zy-bt45', sub: 'Flames of Gaseous Fuels', plat: 'International Space Station (ISS)', hw: 'Advanced Combustion via Microgravity Experiments (ACME), Combustion Integrated Rack', start: '1999-01-14', end: '2025-04-30', lic: null, gb: 2180.4, pubs: 33,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['ethylene (C2H4)', 'propane (C3H8)'], geom: 'Spherical diffusion flames, normal and inverse',
    o2: R(19.8, 85.0, '%', tbl('PSI-10', 'Flame Design_Normal Flame.csv and _Inverse Flame.csv', 'XO2 (init) / XO2')), p: R(43.0, 304.8, 'kPa', tbl('PSI-10', 'Flame Design_Normal Flame.csv and _Inverse Flame.csv', 'pinit (atm)')), flow: null,
    n: 327, files: ['Flame Design_Normal Flame.csv', 'Flame Design_Inverse Flame.csv'], avail: 'run_table_with_conditions', dil: ['N2', 'CO2'], varied: ['oxygen fraction', 'pressure', 'dilution', 'flow rate', 'flame direction'], sensors: ['cameras', 'radiometers', 'photomultiplier tubes', 'thermocouples'],
    sum: 'Spherical gas flames were studied on the station over a broad range of dilutions, flow rates and pressures, in both normal and inverse directions. The aim was to find soot-inception limits and take detailed measurements, observing the flames with cameras, radiometers and thermocouples.',
    why: 'Not aimed at fire safety, but it is one of the few data sets that reaches very high oxygen levels and low pressures.' },
  { id: 'PSI-159', ac: 'ACME CFI-G', title: 'Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases', doi: '10.60555/cyt1-kh64', sub: 'Flames of Gaseous Fuels', plat: 'International Space Station (ISS)', hw: 'ACME, Combustion Integrated Rack (CIR)', start: null, end: null, lic: 'CC0-1.0', gb: 2085.6, pubs: 2,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['ethane', 'propane', 'butane'], geom: 'Spherical diffusion flames, normal and inverse',
    o2: R(12.0, 85.0, '%', tbl('PSI-159', 'CFI-G_Normal Flames.csv and _Inverse Flames.csv', 'XO2 before test / XO2')), p: R(49.5, 331.0, 'kPa', tbl('PSI-159', 'CFI-G_Normal Flames.csv and _Inverse Flames.csv', 'approx p (bar)')), flow: null,
    n: 333, files: ['CFI-G_Normal Flames.csv', 'CFI-G_Inverse Flames.csv'], avail: 'run_table_with_conditions', dil: [], varied: ['fuel', 'oxygen fraction', 'pressure', 'dilution', 'flame direction'], sensors: ['cameras', 'radiometers', 'photomultiplier tubes', 'thermocouples'],
    sum: 'Spherical gas flames were run on the station with several fuels over a range of dilutions, flow rates and pressures, in normal and inverse directions, to find the conditions where cool diffusion flames occur. The flight tests are supported by simulations and chemical-kinetics work.',
    why: 'Not aimed at fire safety, but it covers the widest oxygen range in this collection and includes low-pressure tests.' },
  { id: 'PSI-21', ac: 'ACME CLD Flame', title: 'Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame', doi: '10.60555/23e1-9950', sub: 'Flames of gaseous fuel', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME', start: '2006-10-01', end: '2022-05-31', lic: 'CC0-1.0', gb: 2005.5, pubs: 18,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene'], geom: 'Coflow burner',
    o2: null, p: null, flow: null,
    n: 32, files: ['CLD Flame.csv'], avail: 'run_table_partial', dil: ['N2'], varied: ['coflow velocity', 'fuel dilution'], sensors: ['chemiluminescence imaging', 'soot luminosity', 'laser extinction'],
    sum: 'Methane and ethylene flames on a coflow burner were studied from very dilute to heavily sooting conditions. Measurements include flame shape, lift-off height, extinction limits and soot. The data are meant for rigorous testing of computational models with improved soot sub-models.',
    why: 'Improves prediction of flame extinction and soot, the flame type found in most practical combustion devices.' },
  { id: 'PSI-22', ac: 'ACME E-FIELD Flames', title: 'Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames', doi: '10.60555/se5a-8c73', sub: 'Laminar Flames', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME', start: '2016-11-18', end: '2020-11-17', lic: 'CC0-1.0', gb: 950.2, pubs: 25,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene'], geom: 'Gas-jet and coflow burners with a mesh electrode',
    o2: null, p: null, flow: null,
    n: 32, files: ['ACME E-FIELD Flames.csv'], avail: 'run_table_partial', dil: [], varied: ['electric field strength', 'mesh polarity', 'fuel concentration'], sensors: ['ion current', 'imaging'],
    sum: 'Tests how electric fields change gas flames in microgravity, where the effect can be separated from buoyancy. A high voltage, up to 10 kV, was applied between the burner and a mesh above it, and the ion current and the flame response were measured.',
    why: 'The record says the work is not being conducted to serve space applications, though findings could aid future space-based combustion devices.' },
  { id: 'PSI-23', ac: 'ACME s-Flame', title: 'Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames', doi: '10.60555/k57n-p030', sub: 'Flames of gaseous fuels', plat: 'International Space Station (ISS)', hw: 'Combustion Integrated Rack (CIR), ACME', start: '2015-02-05', end: '2019-11-24', lic: 'CC0-1.0', gb: 782.2, pubs: 44,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['hydrogen', 'methane', 'ethylene'], geom: 'Spherical porous burner',
    o2: R(21, 30, '%', tbl('PSI-23', 'ACME s-Flame.csv', 'Atmosphere* (approximate values)'), 'medium'), p: null, flow: null,
    n: 18, files: ['ACME s-Flame.csv'], avail: 'run_table_partial', dil: ['N2', 'He'], varied: ['fuel mixture', 'atmosphere', 'diluent'], sensors: ['spectrally resolved imaging', 'flame and burner temperatures', 'radiative flux'],
    sum: 'Mixtures of gaseous fuels and diluents were fed through a spherical porous burner to make a nominally spherical, one-dimensional flame. Images, temperatures and radiative flux were recorded for comparison with detailed numerical simulations, using hydrogen, methane and ethylene.',
    why: 'Fundamental flame-structure data for validating chemistry and transport models; indirect value for fire safety.' },
  { id: 'PSI-107', ac: 'SPICE', title: 'Smoke Point In Co-flow Experiment', doi: '10.60555/9kbh-e962', sub: 'Fire Safety', plat: 'International Space Station (ISS)', hw: 'Microgravity Science Glovebox (MSG)', start: null, end: null, lic: 'CC0-1.0', gb: 6.9, pubs: 9,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene', 'propane', 'propylene', 'propylene mixtures'], geom: 'Gas-jet nozzles of 0.41, 0.76 and 1.6 mm in a coflow duct',
    o2: null, p: CABIN, flow: R(-5.9, 85.3, 'cm/s', tbl('PSI-107', 'Spice.csv', 'Air Rate (cm/s)')),
    n: 469, files: ['Spice.csv'], avail: 'run_table_partial', dil: [], varied: ['fuel', 'nozzle diameter', 'fuel flow rate', 'coflow air velocity'], sensors: ['still and video cameras', 'radiative heat loss'],
    sum: 'Gas-jet flames were lit in a flow duct in the station glovebox with a controlled coflow of air. Fuel flow was adjusted to find the smoke point, where the flame starts to emit soot. Flame lengths were recorded for several fuels and burner diameters. In total 526 flames were studied.',
    why: 'Improves understanding of soot formation, which the record links to designing safer spacecraft environments.' },
  { id: 'PSI-106', ac: 'SLICE', title: 'Structure and Liftoff In Combustion Experiment', doi: '10.60555/pm12-rg61', sub: null, plat: 'International Space Station (ISS)', hw: null, start: null, end: null, lic: 'CC0-1.0', gb: 72.9, pubs: 5,
    role: 'fundamental', sec: [], fuel: 'gas', mats: ['methane', 'ethylene', 'ethane', 'nitrogen-diluted mixtures'], geom: 'Exchangeable burner tubes in a fan-driven flow duct',
    o2: null, p: CABIN, flow: null,
    n: 12, files: ['Slice.csv'], avail: 'run_log_only', dil: ['N2'], varied: ['fuel', 'nitrogen dilution', 'coflow velocity', 'burner diameter'], sensors: ['high-resolution still camera', 'flow and temperature sensors'],
    sum: 'Gas flames were lit by hand in a fan-driven flow duct and photographed under controlled coflow air. The study looked at how flames stabilize at their base and when they lift off, and how diluting the fuel with nitrogen affects soot and stability.',
    why: 'Insights into flame stability and soot that the record connects to fire safety and to better numerical models.' },
]

const MODELING = [
  { psi_id: 'PSI-62', title: 'Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography', doi: '10.60555/e9xp-ex83', parents: ['PSI-25', 'PSI-26'] },
  { psi_id: 'PSI-60', title: 'Computational and Experimental Analysis of SPICE Data Sets', doi: '10.60555/mzjm-yv57', parents: ['PSI-107'] },
  { psi_id: 'PSI-115', title: 'Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity', doi: '10.60555/q0v5-1v28', parents: ['PSI-102'] },
  { psi_id: 'PSI-117', title: 'Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis', doi: '10.60555/gz0q-b577', parents: ['PSI-69'] },
  { psi_id: 'PSI-142', title: 'Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames', doi: '10.60555/80qf-vj95', parents: ['PSI-69'] },
]

// Run points with BOTH oxygen and pressure, binned for display: "psi number, O2 % (rounded to 1), pressure kPa (rounded to 5), assumed-pressure flag, run count"
const BINS = '25,22,100,1,18 25,21,100,1,23 25,15,100,1,11 25,17,100,1,26 25,18,100,1,18 25,19,100,1,16 25,20,100,1,4 25,14,100,1,2 25,16,100,1,11 69,21,100,0,28 69,21,310,0,3 69,21,275,0,4 69,21,205,0,2 69,34,70,0,9 69,30,70,0,8 69,30,100,0,3 69,30,105,0,4 69,20,70,0,12 69,21,105,0,6 69,20,75,0,2 69,18,105,0,4 69,18,100,0,21 69,15,100,0,16 69,14,100,0,11 69,13,105,0,4 69,13,100,0,5 69,12,105,0,4 69,12,100,0,4 69,25,70,0,6 69,24,70,0,10 69,23,70,0,19 69,21,70,0,11 69,18,70,0,11 69,17,70,0,11 69,24,100,0,9 69,15,70,0,4 69,20,100,0,15 69,16,100,0,10 69,19,100,0,7 69,17,100,0,10 39,21,100,0,28 39,17,100,0,19 39,21,125,0,9 39,21,205,0,7 39,17,305,0,5 39,21,305,0,9 39,21,505,0,3 39,21,75,0,4 39,21,50,0,3 10,21,105,0,7 10,20,105,0,30 10,21,100,0,21 10,20,100,0,15 10,40,100,0,4 10,39,105,0,6 10,38,105,0,7 10,37,105,0,12 10,38,100,0,6 10,37,100,0,7 10,36,105,0,8 10,30,100,0,3 10,29,100,0,3 10,39,100,0,8 10,40,125,0,4 10,40,130,0,4 10,39,130,0,24 10,38,130,0,15 10,39,125,0,4 10,38,125,0,2 10,37,130,0,3 10,29,105,0,5 10,40,95,0,21 10,85,95,0,5 10,85,100,0,21 10,56,100,0,1 10,57,100,0,5 10,36,100,0,3 10,47,100,0,1 10,85,45,0,2 10,21,45,0,1 10,25,45,0,1 10,35,100,0,1 10,26,100,0,2 10,50,105,0,1 10,50,50,0,1 10,32,50,0,1 10,21,50,0,2 10,43,100,0,3 10,27,100,0,2 10,27,105,0,1 10,46,100,0,1 10,50,100,0,1 10,32,100,0,1 10,46,105,0,1 10,64,100,0,1 10,41,100,0,1 10,85,50,0,10 10,64,50,0,1 10,41,50,0,2 10,26,50,0,1 10,33,50,0,1 10,85,305,0,11 10,49,305,0,1 10,50,305,0,1 10,32,305,0,1 10,85,200,0,3 10,57,200,0,1 10,46,200,0,2 10,36,200,0,1 10,29,200,0,1 159,39,95,0,6 159,38,95,0,8 159,37,95,0,6 159,36,95,0,1 159,21,100,0,27 159,18,100,0,2 159,40,100,0,5 159,39,100,0,28 159,38,100,0,9 159,23,100,0,6 159,39,50,0,3 159,38,50,0,5 159,37,50,0,2 159,36,50,0,3 159,35,50,0,4 159,21,50,0,7 159,40,95,0,1 159,21,205,0,12 159,22,305,0,12 159,37,100,0,2 159,36,100,0,2 159,35,100,0,2 159,34,50,0,1 159,33,50,0,2 159,40,205,0,6 159,39,205,0,14 159,38,205,0,5 159,21,110,0,7 159,15,110,0,6 159,12,110,0,1 159,14,110,0,1 159,15,50,0,1 159,30,50,0,3 159,85,220,0,26 159,85,110,0,20 159,85,55,0,15 159,50,55,0,4 159,30,55,0,6 159,21,55,0,8 159,18,55,0,1 159,85,330,0,18 159,50,330,0,6 159,21,330,0,7 159,50,110,0,5 159,50,220,0,7 159,21,220,0,3 159,18,110,0,1 159,19,110,0,1 159,40,330,0,3 159,70,330,0,1 159,45,330,0,1'
// Row counts per investigation as computed from the full tables; used to catch copy errors in BINS.
const EXPECTED_POINTS = { 'PSI-25': 129, 'PSI-69': 273, 'PSI-39': 87, 'PSI-10': 316, 'PSI-159': 333 }
// Exact run-level counts computed from the full-resolution tables in the browser session.
const RUN_STATS = {
  total_points: 1138,
  near: { // within +/-5 O2 points and +/-10 kPa of the environment
    iss: { 'PSI-10': 74, 'PSI-159': 44, 'PSI-25': 112, 'PSI-39': 47, 'PSI-69': 110 },
    moon_base: { 'PSI-69': 23 }, rover: { 'PSI-69': 23 }, mars_base: { 'PSI-69': 23 },
    spacesuit: {}, earth: { 'PSI-10': 74, 'PSI-159': 44, 'PSI-25': 112, 'PSI-39': 47, 'PSI-69': 110 },
    // These two counts, unlike the ones above, are summed directly from the rounded BINS used for the
    // Evidence Map scatter chart (see docs/DATA_CLEANING_LOG.md), so they can be off by a point or two
    // at a bin edge versus a recompute from the full-resolution table. Added 2026-11-14 for the two new
    // NASA Exploration Atmosphere presets below.
    exploration_atm: { 'PSI-10': 2, 'PSI-159': 29 }, exploration_10_2psi: { 'PSI-69': 43 },
  },
  o2_ge_30: { 'PSI-10': 222, 'PSI-159': 230, 'PSI-69': 24 },
  o2_ge_30_and_p_le_75_recorded: { 'PSI-10': 18, 'PSI-159': 48, 'PSI-69': 17 },
}

// ---------- build investigations ----------
const byId = Object.fromEntries(I.map((x) => [x.id, x]))
const investigations = I.map((x) => ({
  psi_id: x.id, acronym: x.ac, title: x.title, doi: x.doi, url: url(x.id), license: x.lic ?? 'not stated on the record',
  project_type: 'flight', platform: x.plat, hardware: x.hw, start_date: x.start, end_date: x.end, sub_research_area: x.sub,
  fire_safety_role: x.role, secondary_roles: x.sec, fuel_class: x.fuel, fuel_materials: x.mats, geometry: x.geom,
  conditions: { o2_percent: x.o2, pressure_kpa: x.p, flow_cm_s: x.flow, gravity_g: { values: [0], source: { type: 'psi_text', ref: 'Project Type: Microgravity Investigation' }, confidence: 'high' } },
  diluents: x.dil, variables_varied: x.varied, sensors: x.sensors,
  evidence: { n_runs: x.n, table_files: x.files.map((f) => `${x.id}_Experimental table_${f}`), data_availability: x.avail, raw_data_gb: x.gb },
  summary: { text: x.sum, why_it_matters: x.why, generated_by: 'AI-drafted from the PSI record text', human_reviewed: false },
  n_publications: x.pubs, publications: [],
  related_modeling: MODELING.filter((m) => m.parents.includes(x.id)).map((m) => ({ psi_id: m.psi_id, title: m.title, url: url(m.psi_id) })),
  verified: { by: null, date: null },
}))

// ---------- runs ----------
const runs = BINS.split(' ').map((s) => {
  const [n, o, p, a, c] = s.split(',').map(Number)
  const id = `PSI-${n}`
  return { psi_id: id, acronym: byId[id].ac, fuel_class: byId[id].fuel, o2_percent: o, pressure_kpa: p, pressure_assumed: a === 1, flow_cm_s: null, n: c }
})
const sums = {}
runs.forEach((r) => (sums[r.psi_id] = (sums[r.psi_id] || 0) + r.n))
for (const k in EXPECTED_POINTS) if (sums[k] !== EXPECTED_POINTS[k]) throw new Error(`BINS copy error for ${k}: ${sums[k]} vs ${EXPECTED_POINTS[k]}`)
if (Object.values(sums).reduce((a, b) => a + b, 0) !== RUN_STATS.total_points) throw new Error('BINS total mismatch')

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
const gaps = environments.environments.map((e) => {
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
}
for (const r of runs) if (!byId[r.psi_id]) throw new Error('run without investigation')

const w = (f, o) => writeFileSync(join(OUT, f), JSON.stringify(o, null, 1))
w('investigations.json', investigations); w('runs.json', runs); w('environments.json', environments); w('gaps.json', gaps); w('insights.json', insights); w('sources.json', sources); w('earth_applications.json', earth)
console.log(`OK: ${investigations.length} investigations, ${runs.length} bins (${RUN_STATS.total_points} runs), ${gaps.length} environments`)
console.log(JSON.stringify(insights, null, 1))
gaps.filter((g) => g.environment_id === 'moon_base').forEach((g) => g.gaps.forEach((x) => console.log('-', x.severity, x.text)))
