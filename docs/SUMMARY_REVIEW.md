# Summary review sheet (H5)

For REVIEW_ISSUES R05 / PLAN H5. Generated 2026-11-14 from `app/public/data/investigations.json` and the PSI snapshot in `pipeline/raw/`.

**How to review (about 20 minutes).** For each investigation, read the summary and "why it matters" against the PSI record text under it. Check: (1) nothing is stated that the record does not say; (2) nothing important is wrong or misleading; (3) the role and fuel-class labels fit. If it is fine, tick the box and paste the approval line into `"summaries"` in `pipeline/reviews.json` with your initials (drop the trailing comma on the last entry; JSON does not allow it). If not, write the problem under the entry and leave it unapproved. Then run `node pipeline/build_data.mjs`.

If a summary is edited later, its hash changes and the build stops until it is reviewed again.

**Already checked by script:** every number in each summary appears in the PSI record text or in the app data; word limits (80 / 35) hold.

## PSI-25 BASS-II: Burning and Suppression of Solids - II

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) · role: **prevention** (also suppression) · fuel class: **solid** · numbers check: all found

> **Summary:** Solid fuel samples were burned in a small wind tunnel inside the station glovebox. Airflow speed and oxygen concentration were the main variables, with oxygen lowered below 21% by adding nitrogen. The team recorded flame appearance, growth and spread rate in opposed and concurrent flow, and studied ignition and extinction limits.
>
> **Why it matters:** Aims to link the normal-gravity NASA-STD-6001 Test 1 method to actual material flammability in microgravity, to help select safer materials.

<details><summary>PSI record text</summary>

**Objective.** BASS-II results contribute to the combustion computational models used in the design of fire detection and suppression systems in microgravity and on Earth. Objectives Include: 1) Study the ignition, flame growth, flame spread, and extinction limits for solid fuels burning in low-velocity forced flows in microgravity. 2) Begin to bridge the gap between the normal gravity NASA-STD-6001 Test #1 method, ground-based microgravity tests, and actual material flammability in microgravity. 3) Provide SoFIE PIs with preliminary data to refine Science Requirements. 4) Practical, realistic (thicker) fuels in typical geometries will be examined, including slabs, cylinders, and spherical sections. The primary variables include: • Forced flow velocity (speed and direction) • Ambient oxygen concentration (via working volume nitrogen vitiation) • Sample geometry (rods, spherical section, slabs, films, and fabric sheets

**Approach.** To summarize, BASS-II's approach, microgravity combustion tests were performed aboard the International Space Station. Active crew support for real-time “lab partner” operations. The wind tunnel was installed in the Microgravity Science Glovebox which supplied power, imaging, and a level of containment. Fuel samples were mounted inside a small wind tunnel which could impose airflow speeds up to 40 cm/s. Main variables are airflow speed and oxygen concentration (oxygen varied below 21% by adding nitrogen). Flame appearance, flame growth, and spread rates were determined in both the opposed and concurrent flow.

**Hypothesis.** BASS–II tests the hypothesis that materials in microgravity, with adequate ventilation, burn as well if not better than the same material in normal gravity with other conditions being identical (pressure, O2 concentration, temperature, etc.). NASA tests and controls materials from a flammability perspective using an upward burning test in normal gravity, which is considered to be the worst-case geometry for flammability of the material on Earth. However, it may not be conservative for flammability in space. Testing at constant O2 mole fractions permits studying flame spread and extinction at low and high flow speed. We are interested in finding the fundamental limit for a given material.

**Research impacts / Earth benefits.** A primary goal of BASS-II is improved spacecraft fire safety, improved understanding of combustion in space and how to avoid it. If you’re on a mission far from Earth, a fire can be catastrophic. BASS-II helps engineers select the safest materials and improve firefighting methods on future space missions. In outer space, fuels burn as oval balls rather than with an upward pointed cone flame as they do on Earth. This simpler combustion process enables researchers to evaluate computer models of fuel burning. These models can then be used to more accurately study flames on Earth, such as in wildfires, building fires, energy recapture from waste recycling, and other combustion problems.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-25": { "by": "", "date": "", "hash": "7cebb2ca7104" },`
- Notes:

## PSI-26 BASS: Burning and Suppression of Solids

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-26) · role: **prevention** (also suppression) · fuel class: **solid** · numbers check: all found

> **Summary:** Fabric, plastic and other solid samples were ignited in a small flow duct inside the station glovebox, with a fan setting the airflow in the opposed or concurrent direction. Flame size, shape, color, spread rate and quenching were observed. A second objective was to assess an inert gaseous extinguishing agent.
>
> **Why it matters:** Spacecraft materials are selected with a 1-g test (NASA-STD-6001 Test 1); BASS examines how that relates to burning in microgravity.

<details><summary>PSI record text</summary>

**Objective.** The two main objectives for BASS are to: 1.) Begin to bridge the gap between the normal gravity NASA-STD-6001 Test#1 method, ground-based microgravity tests, and actual material flammability in microgravity. The relation between these can be investigated by observing flames burning for the longer times available in flight. Practical, realistic (thicker) fuels in typical geometries will be examined, including wake flames which have characteristics of a fire burning behind another object (for example, a fire burning in tight area which may not be easily accessible). 2.) Assess the effectiveness of an inert, gaseous extinguishing agent (similar to that used on ISS) in putting out flames over different materials, geometries, preheating, and flow.

**Approach.** The experiment was conducted aboard the International Space Station (ISS) inside the Microgravity Glove Box (MSG). Custom-made fabric samples consisting of 75% cotton and 25% fiberglass (by mass) measuring were used as a fuel source as well as Nomex fabric and Ultem. A Kanthal wire (29-gage)igniter was used to initiate combustion at one end of the fabric. Airflow was controlled using a variable speed fan, with airflow speeds reaching as high as 40 cm/s. The airflow was directed along the fuel surface in either the opposed or concurrent direction. This investigation explored two primary air flow configurations; concurrent-flow and opposed-flow. With concurrent-flow air flows in the same direction as the flame spread and in opposed-flow air flows in the opposite direction of flame spread. Flames were observed in the top and edge profiles and data was collected on flame size, shape, color, spread rate, and potential flame quenching. The samples were placed in a small flow duct (76 mm x 76 mm cross section) that allowed for airflow across the fabric. Other sample shapes were utilized as well including spheres and cylinders.

**Hypothesis.** BASS experiments were based on the hypothesis that materials in microgravity, with adequate ventilation, burn as well if not better than the same material in normal gravity with other conditions being identical (pressure, oxygen concentration, temperature, etc.) To test this hypothesis with any but the thinnest materials requires extended microgravity time – longer than available in drop towers or parabolic aircraft.

**Research impacts / Earth benefits.** Current NASA spacecraft materials selection is based on a standard test method (NASA–STD–6001 Test 1) that segregates material based on 1-g behavior without consideration of low gravity effects. A critical element of this understanding is the radiative heat emission from the flame. These results are used in first order models and predictions of heat release in spacecraft fires and as a means to extend heat release data from tests like the NASA cone calorimeter test (NASA–STD–6001 Test 2) to a performance-based material selection process. Using nitrogen as a flame suppressant in microgravity provides a direct link to current and planned extinguishment techniques. BASS results provide essential guidance to ground-based microgravity combustion research efforts. Detailed combustion models are validated using the simpler flow environment afforded by tests in microgravity. Once validated, they can be used to build more complex combustion models needed to capture the important details of flames burning in normal gravity. These models have wide applicability to the general understanding of many terrestrial combustion problems and will guide novel spacecraft design and ensure the safety of future crewed missions.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-26": { "by": "", "date": "", "hash": "17410e53eed0" },`
- Notes:

## PSI-98 SAFFIRE-I: Spacecraft Fire Safety Experiment-I

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-98) · role: **prevention** · fuel class: **solid** · numbers check: all found

> **Summary:** A large piece of cotton-fiberglass fabric, about 0.94 meters long and 0.4 meters wide, was burned inside a Cygnus cargo vehicle after it left the station. Air was drawn through a flow duct at 20 cm/s. Cameras, thermocouples and radiometers recorded how the flame grew.
>
> **Why it matters:** Tests how rapidly a large-scale fire grows in low gravity and compares low-g flammability limits with the normal-gravity screening test.

<details><summary>PSI record text</summary>

**Objective.** The objectives of this investigation were to: (1) determine how rapidly a large scale fire grows in low-gravity and (2) investigate the low-g flammability limits compared to those obtained in NASA’s normal gravity material flammability screening test.

**Approach.** The Saffire-1 experiments was performed on the Orbital Science’s Cygnus resupply vehicle after it deberthed from the ISS. The sample material for Saffire-I is a composite fabric called Sibal consisting of cotton on a fiberglass substrate (75% cotton, 25% fiberglass by weight). It has been used in many space experiments because it burns like cotton but maintains structural integrity after the cotton is consumed. The sample was approximately 0.94 meters long and 0.4 meters wide, simulating a large piece of flammable fabric. The Saffire-1 flight unit had a sample card installed in the middle of a large flow duct. Air is drawn through the flow duct by fans located at the top of the duct with flow straighteners at the bottom of the experiment module. Saffire-I was conducted at an air flow velocity of 20 cm/s. Once the sample was ignited flame images were captured using two cameras. In addition, thermocouples provided flow, flame, and plume temperatures, two radiometers recorded flame radiation, solid state sensors were used to measure pressure, CO2 and O2 mole faction, and two anemometer tracked flow velocity. All data was compressed, and subsequently downlinked.

**Hypothesis.** This investigation hypothesizes that due to large differences between fire behavior in normal and reduced gravity, the use of terrestrial fires and fire standards to design spacecraft fire safety systems presents an inherent risk to the vehicle because of the significant level of uncertainty. While this approach has been successful thus far, the uncertainty and risk will increase as exploration missions venture further from earth with considerably longer transit times for a safe return. There is a significant lack of microgravity data available for spacecraft designers on which to base their fire safety designs and procedures. To address this knowledge gap, this investigation proposed to conduct large-scale fire safety experiments in an expendable spacecraft without risk to a crew.

**Research impacts / Earth benefits.** The Saffire-I experiment provides a new way to study a realistic fire on an exploration vehicle, which has not been possible in the past because the risks are too high. Instruments on an unmanned cargo vessel measure oxygen, carbon dioxide, heat, pressure and flame growth, and two video cameras provide views of the flame. Results determine microgravity flammability limits for several spacecraft materials, help to validate NASA’s material selection criteria, and how microgravity and limited oxygen affect flame size. The investigation is crucial for the safety of current and future space missions. Studying fire in small, sealed environments such as the Cygnus cargo supply vehicle benefits fire safety and prevention efforts on Earth, including inside mines, airplanes, or submarines.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-98": { "by": "", "date": "", "hash": "995c9df90959" },`
- Notes:

## PSI-99 SAFFIRE-II: Spacecraft Fire Experiment-II

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-99) · role: **prevention** · fuel class: **solid** · numbers check: all found

> **Summary:** Nine samples, each 5 cm by 29 cm, were burned on a Cygnus cargo vehicle after it left the station. Materials included silicone, cotton-fiberglass fabric and PMMA. Airflow was 20 or 30 cm/s, concurrent or opposed. The data table lists burn lengths in microgravity next to normal-gravity results.
>
> **Why it matters:** Compares low-gravity flammability limits with those from NASA's normal-gravity material screening test, across several materials.

<details><summary>PSI record text</summary>

**Objective.** The objectives of SAFFIRE-II are to determine how rapidly a large scale fire grows in low-gravity and to investigate the low-g flammability limits compared to those obtained in NASA’s normal gravity material flammability screening test.

**Approach.** The Saffire-II experiment was performed on the Orbital Science’s Cygnus resupply vehicle after it deberthed from the ISS. As a follow on to the Saffire-I investigation, the Saffire-II investigation added more samples including SIBAL, silicone, structure PMMA, flat PMMA, and PMMA with Nomex. The Saffire-1I flight unit had a sample card installed in the middle of a large flow duct. Air is drawn through the flow duct by fans located at the top of the duct with flow straighteners at the bottom of the experiment module. Saffire-II has a sample card that contains 9 samples, each 5 cm x 29 cm. Depending on the sample material, the Saffire-II was conducted at an air flow velocity of either 20 or 30 cm/s, the flow being either concurrent or opposed. Once the sample was ignited flame images were captured using two cameras. In addition, thermocouples provided flow, flame, and plume temperatures, two radiometers recorded flame radiation, solid state sensors were used to measure pressure, CO2 and O2 mole faction, and two anemometer tracked flow velocity. All data was compressed, and subsequently downlinked. Details related to samples and experimental parameters are provided in the Experimental Details file in the Science document folder.

**Hypothesis.** This investigation hypothesizes that due to large differences between fire behavior in normal and reduced gravity, the use of terrestrial fires and fire standards to design spacecraft fire safety systems presents an inherent risk to the vehicle because of the significant level of uncertainty. While this approach has been successful thus far, the uncertainty and risk will increase as exploration missions venture further from earth with considerably longer transit times for a safe return. There is a significant lack of microgravity data available for spacecraft designers on which to base their fire safety designs and procedures. To address this knowledge gap, this investigation proposed to conduct large-scale fire safety experiments in an expendable spacecraft without risk to a crew.

**Research impacts / Earth benefits.** The Saffire-II experiment provides a new way to study a realistic fire on an exploration vehicle, which has not been possible in the past because the risks are too high. Instruments on an unmanned cargo vessel measure oxygen, carbon dioxide, heat, pressure and flame growth, and two video cameras provide views of the flame. Results determine microgravity flammability limits for several spacecraft materials, help to validate NASA’s material selection criteria, and how microgravity and limited oxygen affect flame size. The investigation is crucial for the safety of current and future space missions. Studying fire in small, sealed environments such as the Cygnus cargo supply vehicle benefits fire safety and prevention efforts on Earth, including inside mines, airplanes, or submarines.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-99": { "by": "", "date": "", "hash": "96d3da0b2904" },`
- Notes:

## PSI-100 SAFFIRE-III: Spacecraft Fire Experiment-III

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-100) · role: **prevention** · fuel class: **solid** · numbers check: all found

> **Summary:** A follow-on to Saffire-I using the same cotton-fiberglass fabric on a Cygnus cargo vehicle, but at a flow velocity of 30 cm/s compared with 20 cm/s. The flow was concurrent or opposed. Cameras, thermocouples, radiometers and gas sensors recorded the burn.
>
> **Why it matters:** Extends the large-scale fire-growth test to a higher airflow, for comparison with the normal-gravity flammability screening test.

<details><summary>PSI record text</summary>

**Objective.** The objectives of this investigation were to: (1) determine how rapidly a large scale fire grows in low-gravity and (2) investigate the low-g flammability limits compared to those obtained in NASA’s normal gravity material flammability screening test.

**Approach.** The Saffire-III experiments were performed on the Orbital Science’s Cygnus resupply vehicle after it deberthed from the ISS. As a follow on to the Saffire 1 investigation, the Saffire III investigation also used SIBAL as the sample material. However, the experiments were conducted at a flow velocity of 30 cm/s compared to 20 cm/s during Saffire I. The flow was either concurrent or opposed. Once the sample was ignited flame images were captured using two cameras. In addition, thermocouples provided flow, flame, and plume temperatures, two radiometers recorded flame radiation, solid state sensors were used to measure pressure, CO2 and O2 mole faction, and two anemometer tracked flow velocity. All data was compressed, and subsequently downlinked. Details related to samples and experimental parameters are provided in the Experimental Details file in the Science document folder.

**Hypothesis.** This investigation hypothesizes that due to large differences between fire behavior in normal and reduced gravity, the use of terrestrial fires and fire standards to design spacecraft fire safety systems presents an inherent risk to the vehicle because of the significant level of uncertainty. While this approach has been successful thus far, the uncertainty and risk will increase as exploration missions venture further from earth with considerably longer transit times for a safe return. There is a significant lack of microgravity data available for spacecraft designers on which to base their fire safety designs and procedures. To address this knowledge gap, this investigation proposed to conduct large-scale fire safety experiments in an expendable spacecraft without risk to a crew.

**Research impacts / Earth benefits.** The Saffire-I experiment provides a new way to study a realistic fire on an exploration vehicle, which has not been possible in the past because the risks are too high. Instruments on an unmanned cargo vessel measure oxygen, carbon dioxide, heat, pressure and flame growth, and two video cameras provide views of the flame. Results determine microgravity flammability limits for several spacecraft materials, help to validate NASA’s material selection criteria, and how microgravity and limited oxygen affect flame size. The investigation is crucial for the safety of current and future space missions. Studying fire in small, sealed environments such as the Cygnus cargo supply vehicle benefits fire safety and prevention efforts on Earth, including inside mines, airplanes, or submarines.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-100": { "by": "", "date": "", "hash": "bc4133ab07e5" },`
- Notes:

## PSI-102 SAME: Smoke and Aerosol Measurement Experiment

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102) · role: **detection** · fuel class: **aerosol** · numbers check: all found

> **Summary:** Smoke from overheated spacecraft materials was produced in the station glovebox and sampled. Two smoke detectors were tested against it, and collected particles were later examined with an electron microscope to measure particle dimensions. Sample mass loss was also measured.
>
> **Why it matters:** Provides data on how sensitive existing smoke detectors are to reduced-gravity smoke, toward an advanced fire detector for long missions.

<details><summary>PSI record text</summary>

**Objective.** One of the major goals of this investigation was to quantify the sizes that the liquid smoke particulate achieves in low gravity and to relate the droplet size distribution to the smoke generation and smoke transport conditions in the experiment. A numerical code was to be developed to predict the smoke droplet growth as a function of the fuel pyrolysis rate, the thermodynamic properties of the pyrolysis vapor, and the flow environment.

**Approach.** The crew installed the near field hardware in the Glovebox, attached the Far Field Box to the Glovebox, and positioned the video cameras. The operator then ran the self diagnostic procedures on the two smoke detectors and activated the video cameras, turned on the igniter for a predefined period of time (15 to 60 seconds), and initiated the thermophoretic soot samplers to sample the smoke. The actual duration of each combustion event was typically 2 minutes. After flight, the particulate collected on the thermophoretic probes were analyzed using a Transmission Electron microscope (TEM) to determine primary and aggregate particle dimensions. The remains of the samples were weighed to determine their mass loss. The digital data was transcribed from the video record and analyzed to determine the response of the detectors. Once the flight mass loss rates were determined, 1-g operation conditions to produce the same loss were determined.The measurements were made using smoke generated by overheated spacecraft materials where variables such as the sample temperature, flow field, and particle aging time were more rigorously controlled.

**Hypothesis.** The three hypotheses that motivated this investigation: In a μg environment, with the absence of the strong buoyancy-induced flows, smoke particle growth from a pyrolyzing/smoldering source, as a result of nucleation, condensation, and coagulation, will lead to larger particles compared to those produced in 1g. The formation of the larger particles is favored by the expected higher vapor concentration and smoke residence times near the source due to the reduced velocities and mixing at μg conditions. In particular, it is hypothesized that liquid aerosol smokes produced in microgravity will exhibit substantially larger droplet sizes than under the same conditions in normal gravity (with a corresponding decrease in the particle number density for the same mass of smoke). The change in the size distribution and number density will, in turn, affect the response of the smoke detectors and possibly result in some detectors not producing an alarm when exposed to this smoke.

**Research impacts / Earth benefits.** The SAME experiment will provide technology for an advanced fire detector for future spacecraft that will be used for long duration missions. SAME will provide quantitative data on the sensitivity of these detectors to reduced gravity smokes that will allow evaluation of the adequacy of these existing technologies using relevant data. The current Fire Prevention, Detection, and Suppression (FPDS) program plan allows for the re-evaluation of future sensor technology, to allow new technology and capability to be utilized. The results from SAME are needed to provide the reduced gravity baseline data against which future detection technology developments can be evaluated.The smoke detectors developed from the results of SAME can also be useful in other extreme environments on Earth, such as submarines or underwater laboratories. Accurate detection of smoke in these environments can save lives.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-102": { "by": "", "date": "", "hash": "2403332cf070" },`
- Notes:

## PSI-101 SAME-R: Smoke Aerosol Measurement Experiment-Reflight

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101) · role: **detection** · fuel class: **aerosol** · numbers check: all found

> **Summary:** A reflight of SAME on the same hardware with changes: a new fire-retardant foam sample, broader test conditions including higher heating temperatures and no flow during heating, and a new instrument. The goal was to quantify smoke particle sizes in low gravity. 66 test points were completed.
>
> **Why it matters:** Together with SAME, its results can lead to an advanced fire detector for spacecraft on long-duration missions.

<details><summary>PSI record text</summary>

**Objective.** Similar to the original SAME investigation, the primary objective of the SAME-R investigation was to quantify the sizes that the liquid smoke particulate achieves in low gravity and to relate the droplet size distribution to the smoke generation and smoke transport conditions in the experiment. One of the problems encountered during the SAME investigation was that after the thermal precipitators were returned to the ground, it was found that all the TEM grids were severely contaminated with some unidentified foreign particles, making these grids unusable although some of them showed shapes of certain types of smoke particles. Based on that experience the SAME-R investigation employed several modification covering new materials, extended operating conditions, and diagnostic equipments.

**Approach.** SAME-R utilized the SAME hardware used on-orbit. Based on the experience gained from SAME, SAME-R included the following modifications: 1) a new test material, Pyrell®, an intumescent fire-retardant foam by Foamex, was introduced to replace DBP samples, 2) test conditions were broadened including higher heating temperatures and no-flow during sample heating time, and 3) a new instrument, M-pass, developed in-house GRC, was used to replace one of the two Commercial Diagnostic Enclosures that includes a DustTrak and an ionization detector used in SAME. SAME-R flight tests were conducted from July 16, to September 9, 2010, successfully completing 66 test points. After SAME-R flight tests, three major post–flight ground tests were performed to improve data reduction process and to validate the lognormal distribution assumption, the key to the moment method employed by SAME and SAME-R.

**Hypothesis.** The three hypotheses that motivated the original SAME investigation is also applicable for the reflight SAME-R investigation: In a μg environment, with the absence of the strong buoyancy-induced flows, smoke particle growth from a pyrolyzing/smoldering source, as a result of nucleation, condensation, and coagulation, will lead to larger particles compared to those produced in 1g. The formation of the larger particles is favored by the expected higher vapor concentration and smoke residence times near the source due to the reduced velocities and mixing at μg conditions. In particular, it is hypothesized that liquid aerosol smokes produced in microgravity will exhibit substantially larger droplet sizes than under the same conditions in normal gravity (with a corresponding decrease in the particle number density for the same mass of smoke). The change in the size distribution and number density will, in turn, affect the response of the smoke detectors and possibly result in some detectors not producing an alarm when exposed to this smoke.

**Research impacts / Earth benefits.** Along with the results from the original SAME investigation, the results from SAME-R can lead to technology for an advanced fire detector for future spacecraft that will be used for long duration missions. SAME will provide quantitative data on the sensitivity of these detectors to reduced gravity smokes that will allow evaluation of the adequacy of these existing technologies using relevant data. The current Fire Prevention, Detection, and Suppression (FPDS) program plan allows for the re-evaluation of future sensor technology, to allow new technology and capability to be utilized. The results from SAME are needed to provide the reduced gravity baseline data against which future detection technology developments can be evaluated. The smoke detectors developed from the results of SAME can also be useful in other extreme environments on Earth, such as submarines or underwater laboratories. Accurate detection of smoke in these environments can save lives.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-101": { "by": "", "date": "", "hash": "b91edd74f8c5" },`
- Notes:

## PSI-47 DAFT / DAFT-2: Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-47) · role: **detection** · fuel class: **aerosol** · numbers check: all found

> **Summary:** A risk-reduction test for SAME. A commercial particle counter, the P-Trak, relies on gravity, so it was modified for microgravity and checked on orbit against a second instrument using a standard dust aerosol held in 15-liter bags. No combustion took place.
>
> **Why it matters:** Longer missions on larger vessels need fire detection with better reliability and sensitivity; this checked a key smoke-measurement instrument.

<details><summary>PSI record text</summary>

**Objective.** The focus of DAFT / DAFT-2 was to mitigate the risk for the Smoke Aerosol Measurement Experiment (SAME). SAME relied on a commercially available condensate nuclei counter, the TSI P-Trak, to quantify smoke aerosols in a microgravity environment, however there were concerns that th P-Trak would not be reliable in microgravity as it relies on gravity to recycle isopropyl alcohol used in the measurement process. DAFT / DAFT-2 tests that a modified P-Trak particulate counter would be accurate in microgravity. Summarized objectives include: 1) Demonstrate the Functionality of the Modified TSI P-Trak in Microgravity 2) Compare the TSI P-Trak Performance against the DustTrak control 3) Create and Analyze Aerosol Standards in Microgravity 4) Ensure the reliability of future aerosol experiments

**Approach.** The experimental approach consists of the following components: 1) Modification of Instrumentation: TSI P-Trak was modified for use in microgravity by redesigning the condenser tube to use capillary forces for recycling isopropyl alcohol and removing the mercury switch responsible for detecting instrument orientation. 2) Aerosol Generation: Arizona Red Dust (ARD) was chosen as an aerosol standard due to its ease of dispersion. The ARD was aerosolized with GN2 to create particle samples. The aerosol was contained within 15-liter Mylar bags. 3) On-Orbit Testing: The modified P-Trak gathered data from counting aerosol particles and these data were compared to the DustTrak CNC specifically designed to work in microgravity.

**Hypothesis.** The TSI P-Trak operates by condensing isopropanol around aerosol particulates that are subsequently laser counted. It was hypothesized that the P-Trak would not work in microgravity due to two potential failure modes that exist. 1) the system would clog or become obscured by isopropanol, and 2) the internal air-flow dynamics of the optics chamber of the device will cause an over counting of particulates. The TSI P-Trak was modified for microgravity use via using capillary action to recycle the isopropanol. Therefore, there are two basic hypotheses: 1) that the P-Trak, as modified for use in SAME, would function normally in microgravity. 2) that the aerosol created and filtered per the experiment design would be within the measurement capabilities of the test devices.

**Research impacts / Earth benefits.** Extended duration space flight missions with larger vessels will require fire detection systems with increased reliability and sensitivity. This research will impact the development of novel fire and smoke detection systems for the International Space Station and future spacecrafts. Additionally, the successful adaptation of the TSI P-Trak for microgravity can inform the design of instruments for use in other challenging Earth environments, such as submarines or underwater laboratories where accurate detection of smoke can save lives.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-47": { "by": "", "date": "", "hash": "a4d631ad8cd8" },`
- Notes:

## PSI-69 FLEX: Flame Extinguishment Experiment

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-69) · role: **suppression** · fuel class: **liquid_droplet** · numbers check: all found

> **Summary:** Single droplets of liquid fuel were ignited in a sealed chamber while oxygen level, pressure and diluent gas were changed. The aim was to map flammability limits in microgravity, including the limiting oxygen index as a function of pressure, and to measure how well gaseous suppressants such as CO2 and He work.
>
> **Why it matters:** Directly supports fire-suppression choices for spacecraft, where traditional suppression methods may be ineffective.

<details><summary>PSI record text</summary>

**Objective.** The FLEX (Flame Extinguishment Experiment) investigation aims to map the flammability limits of liquid fuels in microgravity environments, measure the effectiveness of various gaseous fire suppressants such as CO2, He, and SF6, and develop reliable predictive models for combustion limits under reduced gravity conditions. The mission seeks to validate and improve simplified models by incorporating detailed chemical reactions, heat transfer, and material movement, using both space-based data and extensive ground-based tests. Key flight experiment goals include obtaining high-resolution measurements of droplet burning rates, flame extinction behavior, heat radiation, soot levels, and temperature profiles, while systematically analyzing the effects of different ambient conditions and suppressant concentrations. These investigations are essential for advancing the fundamental understanding of combustion processes in microgravity and enhancing fire safety protocols for future space missions.

**Approach.** The FLEX experiments involve igniting and observing the burning behavior of relatively large droplets. A primary objective of the experiments is to determine the Limiting Oxygen Index (LOI) as a function of ambient pressure and determine how the presence of a suppressant influences the LOI . The basic outline of the procedure to construct this diagram is as follows: 1. Select the test pressure (0.5 − 1.5 atm) for the LOI tests. 2. Select a smaller droplet size (≈ 3 mm) 3. Select an ambient oxygen mole fraction that, based on ground-based testing, will support droplets burning to completion (as opposed to extinguishing at a finite droplet size). 4. Perform a droplet combustion test. 5. Increase the droplet size or repeat the test (if finite extinction diameter at flame extinction observed). 6. Continue steps 4 and 5 until flame exists for only a short time after ignition (radiative extinction). 7. Continue steps 4 thru 6 at a decreased ambient oxygen mole fraction. 8. Continue step 7 to an ambient oxygen mole fraction where the droplet does not ignite. There were ambient conditions where the extinction droplet sizes at all ambient oxygen mole fractions were too small to either be observed or measured with the available diagnostics. In this case, the determination of the LOI is similar, but more iterative. Instead of observing flame extinction, however, the procedure involved an iterative sequence of tests (burn to completion followed by a no ignition test) with progressively smaller increments in ambient oxygen mole fraction to determine the LOI . For the slow flow tests (in the flight experiment), the configuration of the flight hardware did not allow for adequate diagnostics over the entire test for a droplet in a uniform, steady convective flow. In these tests, the procedure will be to duplicate tests above which yield finite-sized extinction droplet diameters. Near the end of the tests, prior to flame extinction, the droplet will be subjected to a small, sub-buoyant, convective flow (imparted by translating the droplet at a slow, uniform speed). The goal of the experiment is then to see how the presence of this flow influences the extinction process. Note, a large number of the tests involve free droplets (as opposed to fiber-supported droplets) and a number of these tests will have droplets with a slow drift velocity. Data gathered from these tests to examine the influences of a small, sub-buoyant flow on both the burning and extinction process.

**Hypothesis.** The primary hypothesis of the FLEX mission is that microgravity conditions fundamentally alter the combustion and extinction characteristics of liquid fuel droplets due to changes in species and energy transport dynamics, radiative heat loss, and chemical kinetics. Specifically, the hypothesis posits that the lack of buoyant convection in microgravity will lead to significant differences in the flammability limits and suppression efficacy of various fire suppressant agents compared to normal gravity conditions. This hypothesis underpins the design of the FLEX experiments, which aim to map flammability boundaries, quantify suppressant efficacy, and develop predictive models to improve fire safety in space environments.

**Research impacts / Earth benefits.** The research impacts and Earth benefits of the FLEX mission are significant and multifaceted. By enhancing our understanding of microgravity combustion, the mission directly contributes to improved fire safety protocols for future space missions, ensuring the safety of crew members in environments where traditional fire suppression methods may be ineffective. On Earth, the insights gained from these experiments have the potential to advance fire safety in confined and reduced-gravity environments, such as submarines or high-altitude aircraft. The mission's findings on the effectiveness of various fire suppressants, including CO2, He, and SF6, in microgravity can lead to the development of more efficient and less harmful fire suppression systems, reducing the risk of toxic byproducts during fire events. Additionally, the study of ''cool flames'' and low-temperature combustion processes observed in microgravity can inform the design of advanced combustion engines, leading to improved fuel efficiency and reduced emissions in automotive and industrial applications. Overall, the FLEX mission's contributions to combustion science have the potential to enhance both space exploration safety and terrestrial fire safety technologies.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-69": { "by": "", "date": "", "hash": "3dda38bce51a" },`
- Notes:

## PSI-68 FLEX-2: Flame Extinguishment Experiment - 2

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-68) · role: **fundamental** (also suppression) · fuel class: **liquid_droplet** · numbers check: all found

> **Summary:** Extends FLEX to more fuels, including two-component droplets, and to a wider range of conditions. The chamber atmosphere was varied in pressure and oxygen concentration with a diluent gas making up the balance. The results are benchmark data for validating simulations and new models of droplet burning and extinction.
>
> **Why it matters:** Adds flame-extinction data for more fuels and atmospheres, though its stated focus is engine-relevant combustion more than spacecraft fire safety.

<details><summary>PSI record text</summary>

**Objective.** The primary goal of the FLEX-2 flight experiments is to extend the results of FLEX-1 to fuels and environmental conditions that mimic real combustor conditions, as well as, provide benchmark experimental data on bi-component droplet combustion over a wide range of initial conditions in order to validate numerical simulations and to develop new theoretical models. Detailed experimental objectives can be further itemized as: 1. Investigate the role of liquid-phase mixing on the burning characteristics of bi-component fuel droplets. 2. Examine the steady and unsteady liquid and gas-phase phenomena in pure fuel combustion. 3. Study flame extinction mechanisms and their boundaries. 4. Analyze the soot formation process, including soot volume fraction soot-shell dynamics. 5. Determine the influence of droplet interactions on the flammability limits and extinction behavior of droplet arrays. 6. Validate theoretical models of droplet combustion through comprehensive experimental data collection in microgravity environments.

**Approach.** The chamber was filled with the appropriate atmosphere, which was varied in pressure between 0.5 atm to 3.0 atm and O2 concentration between 0.1 to 0.4 mole fraction with the diluent gas making up the balance. A settling time of approximately 2 minutes elapsed prior to initiating the test in order to ensure that the temperature and pressure of the chamber gases have stabilized. This settling time was followed by the dispensing of a predetermined amount of fuel (based on the target droplet size) onto the support fiber for those tests in which the droplet is not freely deployed. When sufficient fuel has been dispensed the dispensing needles were retracted and a dwell period of at least 10 seconds was allowed for the droplet internal fluid motion induced by deployment to subside. This was then followed by initiating power to the ignitor for a selectable amount of time ranging from 1 second to 5 seconds after which the ignitor was retracted from the field of view. If the flow field is to be generated by translating the droplet then droplet motion would commence at the same time that the ignitor is retracted. A near real-time download of the color camera video was employed in order to verify successful droplet deployment, ignition, and overall progress of the experiment. Pressure and temperature data of the chamber environment was also recorded in near real time. The overall investigation approach can be summarized as: 1. Test parameters are determined, including pressure, temperature, fuel mixture, and humidity. 2. Fill the combustion chamber with the selected gas mixtures. 3. Deploy the droplet(s) carefully controlling the droplet diameter. 4. Allow the droplet to stabilize in the microgravity environment. 5. Ignite the droplet in a uniform and controlled fashion. 6. Monitor combustions and track flame evolution using high speed photography. 7. Monitor and adjust experimental conditions as needed. 8. Analyze data. The independently varied experimental parameters during FLEX-2 experiments were 1) Fuel type 2) Ambient gas composition 3) Ambient Pressure 4) Droplet initial diameter 5) Droplet translation velocity (and acceleration) 6) Droplet spacing and initial size in a binary linear array.

**Hypothesis.** Fairly sophisticated numerical simulations of convective droplet combustion have been developed in the last decade where the key contribution is the inclusion of full Navier-Stokes equations for the gas-phase flow field. However, due to the inherent complexity of the problem, varying degrees of approximations have been made in treating the chemistry, radiation, and the coupling between the gas and liquid phases. The validity of the assumptions or the hypothesis used in these simulation have not been confirmed by using benchmark data. By conducting these experiments in a microgravity environment, the effects of buoyancy are minimized, and the droplet can be characterized only as a function of thermocapillary or solutalcapillary stresses allowing for a clear observation of the fundamental combustion processes, The present FLEX-2 experiments using bi-component mixtures. In addition, the microgravity environment allows study of such phenomena as the transitions between radiative and diffusive extension of the flame. The primary goal of the flight experiments is to provide benchmark experimental data on bi-component droplet combustion over a wide range of initial conditions that could be used to validate numerical simulations and to develop new theoretical models.

**Research impacts / Earth benefits.** The combustion of liquid fuels is the overwhelming energy source in the transportation sector. Insights gained from these studies can lead to more efficient and cleaner combustion technologies which are crucial for reducing pollution and greenhouse gas emissions. By improving fuel efficiency and developing better fuels, these experiments can contribute to: 1) More sustainable energy production. 2) Future combustor designs with minimal carbon footprint, maximum fuel efficiency and less pollutant emissions. 3) Allow quantitative evaluation of the performance of future fuels in combustors through the development of surrogates (mixtures of pure fuels that simulate the behavior of real fuels). 4) Validation of jet engine models by engine manufacturers with support from prior droplet results.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-68": { "by": "", "date": "", "hash": "5121ddbb6f9e" },`
- Notes:

## PSI-39 CFI: Cool Flames Investigation

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-39) · role: **fundamental** · fuel class: **liquid_droplet** · numbers check: all found

> **Summary:** Fuel droplets were burned in a sealed chamber to study cool flames, a low-temperature burning mode. The tests varied pressure and helium dilution and looked at how droplet size and pressure relate to flame extinction, using n-dodecane and its mixtures.
>
> **Why it matters:** Cool flames matter for understanding ignition of practical fuels; a flame that keeps burning in a cool mode is also relevant to knowing when a fire is truly out.

<details><summary>PSI record text</summary>

**Objective.** The objectives of this investigation are to: 1) Examine the combustion behavior of n-dodecane and mixtures of n-dodecane/iso-dodecane at pressures ranging from 0.25 atm to 5 atm. 2) Analyze the effects of helium dilution on cool flame behavior. 3) Examine the behavior of combustion characteristics. 4) Investigate the relationship between droplet size, pressure, and flame extinction, and (5) understand the consequence of soot formation during cool flame combustion.

**Approach.** The Combustion Integrated Rack (CIR) contains the Multi-User Droplet Combustion Apparatus (MDCA) which facilitates the controlled combustion of fuel droplets. A system of gas bottles and fuel syringes delivers the desired gas mixture to the combustion chamber ranging from 0.25 to 0.5 atm. Droplets of fuel are dispensed and suspended between hypodermic needles or tethered using silicon-carbide fibers. A hot-wire igniter is positioned near the droplet for ignition. After ignition the wire is retracted. Fuels observed include n-dodecane, farnesane, and mixtures of n-dodecane/iso-dodecane. Fuels diluted with molecular oxygen, atomic nitrogen, and helium to study the influence on flame extinction and dynamics. Flames were observed with a black-and-white camera for droplet size measurements. A UV camera was used for capturing the OH* radical emissions and flame size. Other high resolution cameras were used for monitoring and documentation. Narrow-band and wide-band radiometers for analyzed flame radiation.

**Hypothesis.** Flame combustion of liquid hydrocarbon fuels such as n-dodecane, n-dodecane/iso-dodecane mixtures, and faresane in microgravity can provide insights into low-temperature chemical kinetics, revealing critical parameters like droplet extinction diameters and flame dynamics that are not observable on Earth.

**Research impacts / Earth benefits.** A basic understanding of cool flames is important for understanding ignition phenomena of practical fuels and fuel additives. Cool flames play a key role in the development and selection of new fuels and the design of advanced engines such as clean, high-efficiency Homogeneous Charge Compression Ignition (HCCI) engines. The research will also help combustion chemists to develop new computational models to compute combustion performance in for many practical applications on earth, including an understanding of how cool flame reactivity determines octane and cetane number for fuels in spark ignition and diesel engines. Cool Flames Investigation (CFI) will provide critical validation for complex chemical kinetic mechanisms, advance the understanding of flame dynamics and instabilities in low-temperature combustion, and support the design of safer spacecraft systems by refining knowledge of combustion in microgravity environments.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-39": { "by": "", "date": "", "hash": "b019ef2904ac" },`
- Notes:

## PSI-20 ACME BRE: Advanced Combustion via Microgravity Experiments - Burning Rate Emulator

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-20) · role: **prevention** · fuel class: **gas** · numbers check: all found

> **Summary:** A gas burner was used to emulate the burning of solid and liquid materials in still microgravity air. Gas flames on porous circular burners of 25 and 50 mm diameter were observed while oxygen concentration and pressure were varied, to build a flammability map in terms of material properties.
>
> **Why it matters:** Burning matching materials such as PMMA and Nylon was observed without air flow, although stopping ventilation is an established step in fighting spacecraft fires.

<details><summary>PSI record text</summary>

**Objective.** The BRE flight program seeks to establish the burning conditions in a quiescent microgravity ambient in terms of material properties. The specific flight objectives are as follows. 1. Observe burning behavior in long-duration microgravity for CH4/N2 and C2H4/N2mixtures on porous circular burners of 25 and 50 mm diameter. Consider O2/N2 ambients with various pressures and ambient O2 concentrations and pressures. NASA - considered atmosphere for human space missions will be examined: 14.7 psia, 21 % oxygen: 10.2 psia, 26.5 %; and 8.2 psia, 34 % oxygen. Emphasize fuel conditions that can be related to a diverse range of condensed fuels. 2. Consider the conditions of Objective 1 for ambients of O2/CO2 (desired). 3. Consider the conditions of Objectives 1 – 2 for extinction limits.

**Approach.** To accomplish the above objectives, flight experiments are proposed. Additionally, preliminary flight tests will be performed to verify the experiment operations and for comparison with ground-based tests. For each test, conditions will be established for the chamber contents, namely choice of diluent, oxygen concentration, and pressure. Fuel flow will commence followed by ignition. The flames will initially be observed without varying the fuel flow rate. Because burner surface temperature and heat flux will vary, this will allow a broad range of conditions to be observed during a single test. As the surface temperature of the burner increases, and the flame remains steady, a continuous set of data is produced for the flammability map. Eventually either the flame will extinguish, the surface temperature of the burner will equilibrate, or the temperature limit of the heat flux sensor will be reached. At this time the fuel flow will be terminated. So a test should terminate for a given flow rate at extinction, and for continued burning when the burner surface temperature has steadied or the temperature limit of the heat flux sensor is neared. The extinction limit could be found once the burner temperature has steadied, and the heat flux sensor has not exceeded its limit. At that state, the flow rate can be reduced in small increments, until extinction is observed and the flow rate shut off. Again, in this process, new data is being produced for the flammability map. Ignition limit tests are not proposed for microgravity, but we will explore these under normal gravity. We believe there is better control on Earth-based ignition testing and that these results should carry over to microgravity conditions. In addition to the flight experiments, in normal gravity testing will continue. These tests will involve gaseous, liquid, and solid fuels. These experiments will further establish the validation of the BRE for 1-g applications and show its usefulness to establish 1-g ignition and extinction limits. As available, drop facility testing will be used to refine procedures, test instrumentation, and help to establish viable flow conditions. We will also pursue a CFD model for the quiescent microgravity burning. This will also guide us in the flight experiments, and potentially provide a predictive methodology.

**Hypothesis.** The BRE investigation hypothesizes that there can exist a regime of quasi-steady burning in microgravity as a function of materials properties. Steady burning may never be achieved, and only slowly changing unsteady flames are possible. The proposed tests aboard the ISS aims to query this hypothesis by establishing a range of quasi-steady burning conditions for condensed fuels in the microgravity environment. It is hypothesized that BRE can determine a range of burning conditions in microgravity as a function of heat of gasification, reradiation heat flux, applied radiant heat flux, heat of combustion and smoke point. This could enable the Cone Calorimeter (NASA Test 2) test as a basis for establishing flammability maps for real materials. The key hypothesis is that the heat of combustion, smoke point, and heat of gasification of the fuel mixture will represent a real solid fuel (or liquid fuel absorbed in an inert matrix). Thus achieved steady burning would represent the potential for real solid fuels to achieve steady burning in microgravity. Other than a candle flame, this has not been shown before.

**Research impacts / Earth benefits.** BRE yielded important data relevant to spacecraft fire safety. Quasi-steady burning corresponding to various condensed-phase materials (such as PMMA and Nylon) was observed in microgravity despite the absence of air flow, where the cessation of ventilation is an established step in putting out spacecraft fires. The ongoing combustion without air flow was notably seen in elevated-oxygen atmospheres which are being considered for use in future spacecraft, whereas such flames in a normal atmosphere of 21% oxygen self-extinguished in a short time. While BRE’s results are still preliminary, they suggest that NASA may want to increase use of its alternative flammability Test 2, with the cone calorimeter, where that test can measure material properties corresponding to the microgravity flames observed with the BRE burner.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-20": { "by": "", "date": "", "hash": "81894ea4c4dd" },`
- Notes:

## PSI-10 ACME Flame Design: Advanced Combustion via Microgravity Experiments / Flame Design

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-10) · role: **fundamental** · fuel class: **gas** · numbers check: all found

> **Summary:** Spherical gas flames were studied on the station over a broad range of dilutions, flow rates and pressures, in both normal and inverse directions. The aim was to find soot-inception limits and take detailed measurements, observing the flames with cameras, radiometers and thermocouples.
>
> **Why it matters:** Not aimed at fire safety, but its normal flames burned in chamber atmospheres of up to 40% oxygen, among the highest in this collection, at about 1 atm.

<details><summary>PSI record text</summary>

**Objective.** The primary objectives of this flight experiment are: A. Obtain soot-inception limits of quasi-steady normal and inverse spherical diffusion flames as functions of flow rate, Zst, amount of inert (N2 or CO2), and pressure for C2H4 and CH4 flames. Identify the corresponding temperatures in hot regions. Obtain similar limits and temperatures for inverse and normal coflow flames. B. Obtain detailed measurements in quasi-steady normal and inverse spherical diffusion flames for C2H4 and CH4. Determine the effects of flow rate, Zst, amount of N2, and pressure on flame temperature, size, color, and soot volume fraction. Evaluate the possible existence of steady flames. C. Obtain extinction limits as functions of Zst, amount of N2, and pressure for normal and inverse spherical C2H4 and CH4 flames. Identify the corresponding temperatures in hot regions. Identify the presence of radiative or kinetic extinction. Evaluate whether pseudo-flammability limits can be obtained for these flames.

**Approach.** Perform spherical diffusion flame tests in drop towers and aboard the International Space Station. Consider a broad range of reactant dilutions, flow rates and pressures for normal and inverse convection directions. Observe the flames with a broad suite of cameras, radiometers, photomultiplier tubes, and thermocouples.

**Hypothesis.** 1. Soot formation requires a region where local C/O ratio and T exceed their critical values, and where strain rate is sufficiently low. 2. Microgravity spherical diffusion flames extinguish when the peak temperature first decreases below 1130 K. 3. Steady-state spherical diffusion flames are possible.

**Research impacts / Earth benefits.** This project has the potential for improving efficiency and reducing pollutant emissions in terrestrial combustors. For example, it is contributing to novel designs of future coal power plants.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-10": { "by": "", "date": "", "hash": "4ed89a9eb487" },`
- Notes:

## PSI-159 ACME CFI-G: Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-159) · role: **fundamental** · fuel class: **gas** · numbers check: all found

> **Summary:** Spherical gas flames were run on the station with several fuels over a range of dilutions, flow rates and pressures, in normal and inverse directions, to find the conditions where cool diffusion flames occur. The flight tests are supported by simulations and chemical-kinetics work.
>
> **Why it matters:** Not aimed at fire safety, but its normal flames burned in atmospheres of up to 40% oxygen, including tests near half an atmosphere.

<details><summary>PSI record text</summary>

**Objective.** 1. Plan and support flight testing on the International Space Station (ISS). 2. Determine the conditions for which cool diffusion flames occur for propane, n-butane, and n-pentane; normal and inverse flames; and a broad range of Zst, Tad, and fluent flow rate. 3. Support the flight tests with advanced CFD simulations. 4. Identify or develop a chemical kinetics mechanism that yields good agreement between the CFD predictions and the ISS measurements. 5. Disseminate the results as widely as possible.

**Approach.** Perform spherical diffusion flame tests aboard the International Space Station. Consider multiple fuels, a range of reactant dilutions, flow rates, and pressures for normal and inverse convection directions. Observe the flames with a broad suite of cameras, radiometers, photomultiplier tubes, and thermocouples.

**Hypothesis.** The hypotheses of this research are that testing aboard the ISS can demonstrate the following for the first time, contributing to an improved understanding of cool flame kinetics. 1. Steady-state cool diffusion flames on spherical porous burners. 2. Cool diffusion flames burning propane, n-butane, and n-pentane. 3. Cool diffusion flames for a wide range of Zst, Tad, and pressures. 4. Inverse cool diffusion flames. 5. Cool diffusion flames for which a decrease in fluent flow rate will cause extinction, whereas an increase will cause a transition to a hot diffusion flame, with oscillation possible between hot and cool flames.

**Research impacts / Earth benefits.** Combustion provides 86% of the world’s energy and an even higher fraction of the energy used for transportation. The internal combustion engines used for transportation generally have thermal efficiencies of 38% or lower because of thermal losses. These efficiencies may increase to 60% if future engines can take advantage of ultra-lean combustion. However, this progress is being impeded by the limited understanding of the chemistry of cool flames. Research into cool diffusion flames (whose peak temperatures are 500 – 1000 K) has grown exponentially since they were discovered in 2012. The measurements performed for this project will help to test and advance cool flame kinetics mechanisms. This should facilitate the development of more efficient internal combustion engines.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-159": { "by": "", "date": "", "hash": "8abc796e391c" },`
- Notes:

## PSI-21 ACME CLD Flame: Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-21) · role: **fundamental** · fuel class: **gas** · numbers check: all found

> **Summary:** Methane and ethylene flames on a coflow burner were studied from very dilute to heavily sooting conditions. Measurements include flame shape, lift-off height, extinction limits and soot. The data are meant for rigorous testing of computational models with improved soot sub-models.
>
> **Why it matters:** Improves prediction of flame extinction and soot, the flame type found in most practical combustion devices.

<details><summary>PSI record text</summary>

**Objective.** In order to provide the experimental data needed to allow rigorous testing of computational models at the extremes of the fuel dilution spectrum, we have the following objectives: A) Characterize the behavior of weak coflow diffusion flames of methane and ethylene, as a function of velocity and fuel dilution, through measurement of flame shape, lift-off heights, temperatures and extinction limits. B) Characterize the sooting tendencies of diffusion flames with long residence times, as a function of velocity and fuel dilution, through measurement of flame shape, gas temperatures in the soot-free portion of the flame, soot luminosity, soot temperatures, and soot volume fractions.

**Approach.** ACME CLD Flame project goals include the generation of improved computational models with improved soot sub-models that are effective for both dilute flames and sooting flames that vary from low to high soot loading levels. The enhanced time and spatial scales in a microgravity environment will be important for achieving both goals. Experimentally, we plan to study methane and ethylene diffusion flames over a wide range of test conditions. For the more dilute flames, measurements will be made of flame chemiluminesence of OH* and CH* to observe variations in lift-off height and flame shape as extinction limits are approached. The sooting tendencies of the more fuel-rich flames will be investigated using soot luminosity and laser extinction measurements to determine soot temperatures and soot volume fractions. Flame temperatures in non-sooting regions will be measured using thin-filament pyrometry. Based on observations, modifications can be made to the kinetics and soot model to match better the experimental results. If the overall agreement of the measurements and computations is good, the results of the computations can be “mined” to provide insight on species (and hence chemical processes) that cannot be measured directly using the diagnostics available for the proposed experiment.

**Hypothesis.** This investigation was focused on gathering bench mark data to validate the hypothesis of computation models, the details of which are available within the following publications: 1) Smooke, M.D., Hall, R.J., Colket, M.B., Fielding, J., Long, M.B., McEnally, C.S., and Pfefferle, L.D., Investigation of the transition from lightly sooting towards heavily sooting co-flow ethylene diffusion flames. Combustion Theory and Modelling, 2004. 8(3): p. 593-606. https://doi.org/10.1088/1364-7830/8/3/009 2) Luque, J., Jeffries, J.B., Smith, G.P., Crosley, D.R., Walsh, K.T., Long, M.B., and Smooke, M.D., CH(A-X) and OH(A-X) optical emission in an axisymmetric laminar diffusion flame. Combustion and Flame, 2000. 122(1/2): p. 172-175. https://doi.org/10.1016/S0010-2180(00)00112-7 3) Walsh, K.T., Fielding, J., Smooke, M.D., and Long, M.B., Experimental and computational study of temperature, species, and soot in buoyant and non-buoyant coflow laminar diffusion flames. Proceedings of the Combustion Institute, 2000. 28: p. 1973-1979. https://doi.org/10.1016/S0082-0784(00)80603-7 4) Walsh, K.T., Long, M.B., Tanoff, M.A., and Smooke, M.D., Experimental and computational study of CH, CH*, and OH* in an axisymmetric laminar diffusion flame. Proceedings of the Combustion Institute, 1998. 27(Vol. 1): p. 615-623. https://doi.org/10.1016/S0082-0784(98)80453-0

**Research impacts / Earth benefits.** Diffusion flames are the flame type of most practical combustion devices. The ability to predict the coupled effects of complex transport phenomena with detailed chemical kinetics in such systems is critical in the modeling of turbulent reacting flows and in understanding the processes by which soot formation and radiative transfer take place. In addition, an understanding of those factors that affect flame extinction in diffusion flames is critical in the suppression of fires and in improving engine efficiency. While normal gravity combustion studies can provide important information on combustion processes, the effects of gravitational forces often complicate the interpretation of both computational and experimental results. Momentum effects dominate most practical combustion devices, but the contribution of buoyancy forces is hard to eliminate in normal gravity. A goal of the study will be to apply sophisticated numerical tools and quantitative diagnostic techniques to the study of hydrocarbon diffusion flames in a microgravity environment. This will lead to a more detailed understanding of the interaction of convection, diffusion and chemistry under momentum-dominated conditions.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-21": { "by": "", "date": "", "hash": "d01bb2c5a052" },`
- Notes:

## PSI-22 ACME E-FIELD Flames: Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-22) · role: **fundamental** · fuel class: **gas** · numbers check: all found

> **Summary:** Tests how electric fields change gas flames in microgravity, where the effect can be separated from buoyancy. A high voltage, up to 10 kV, was applied between the burner and a mesh above it, and the ion current and the flame response were measured.
>
> **Why it matters:** The record says the work is not being conducted to serve space applications, though findings could aid future space-based combustion devices.

<details><summary>PSI record text</summary>

**Objective.** The objective of this investigation is to better understand the relationship between electric field voltage and chemi-ion current, analyze the dynamic response of flames to electric field changes, evaluate soot formation, and characterize stabilized near-limit lifted flames.

**Approach.** The E-FIELD flames experiment investigates how electric fields influence the behavior of laminar diffusion flames in microgravity. This unique environment is ideal for isolating electric field effects from buoyancy forces. The experiment is conducted with gas-fueled flames, both with and without a coflow of air. In the former case, the tests are conducted using the same coflow burner used by the Coflow Laminar Diffusion (CLD) Flame experiment. An electric field is generated by creating a high voltage (up to 10 kV) differential between the burner and a flat circular mesh suspended above (i.e., downstream of) the burner. Measurements, as a function of the field strength and fuel, are taken of the ion current through the flame and the flame’s response time to electric forcing. The gas-jet burner is used to create a small, focused flame for detailed ion-driven convection studies while the coflow burner surrounds the fuel jet with a weak synthetic air flow to enable flame stability and soot behavior analysis. A high-voltage copper mesh electrode positioned above the burner tip generated an electric field with controlled polarity and strength. The electric field interacts with ions generated through chemi-ionization during combustion, driving ion-driving convection and influencing flame behavior. Methane and ethylene were used as fuels and diluted with nitrogen to control flame strength. Dilution levels were varied to explore a range of combustion dynamics, from highly stable to near-extinction flames. Voltage-current curves were recorded to assess the relationship between electric field strength and chemi-ion current, revealing ion-driven convection effects. High-resolution cameras captured flame shape, luminosity, and soot distribution. Spectral imaging with filters measures chemiluminescent emissions and soot volume fraction. There were thermopile detectors to measure flame radiant emissions. All experiments were conducted in the combustion integrated rack (CIR). Tests were administered with Glenn Research Center (GRC) directing astronaut actions. Parameters such as fuel flow rate, coflow velocity, and field polarity are were varied to isolate specific effects on ion production, flame stability, and soot behavior.

**Hypothesis.** The application of electric fields in microgravity environments will significantly influence laminar diffusion flames by enabling precise manipulation of flame stability, soot behavior, and combustion dynamics through ion-driven convection and chemi-ionization processes.

**Research impacts / Earth benefits.** The E-FIELD Flames research is not being conducted to serve any space applications, but it is possible that its findings could aid the development of future space-based combustion devices (e.g., for solid waste processing). The use of electric fields to control flames can reduce the production of harmful pollutants in practical terrestrial combustion. The combustion of fossil fuel is the primary human source of greenhouse gas and acid rain and furthermore creates soot, which can be beneficial but is also a health hazard. Combustion using electrical fields may also allow for more efficient combustion, reducing fuel consumption in addition to unwanted emissions.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-22": { "by": "", "date": "", "hash": "febefe56c5bc" },`
- Notes:

## PSI-23 ACME s-Flame: Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-23) · role: **fundamental** · fuel class: **gas** · numbers check: all found

> **Summary:** Mixtures of gaseous fuels and diluents were fed through a spherical porous burner to make a nominally spherical, one-dimensional flame. Images, temperatures and radiative flux were recorded for comparison with detailed numerical simulations, using hydrogen, methane and ethylene.
>
> **Why it matters:** Fundamental flame-structure data for validating chemistry and transport models; indirect value for fire safety.

<details><summary>PSI record text</summary>

**Objective.** A series of experiments is proposed with the following specific objectives, in both soot-free and sooty flames, to compare with detailed computational simulation to assess transport properties and detailed chemical kinetics (including chemiluminescence): Objective A. Measure and characterize the transient structure (such as temperature and species distribution) of diffusion flames established at initially non-steady, spherical flame structures for mixtures of different H2/CH4/diluent ratios (soot-free) and different C2H4/diluent ratios (sooty), for different flow rates. Objective B. Determine the quasi-steady convective/chemical-kinetic extinction limits (low system Damköhler numbers) and radiative/chemical-kinetic extinction limits (high system Damköhler numbers) for mixtures of different H2/CH4/diluent ratios (soot-free) and different C2H4/diluent ratios (sooty). Objective C. Determine the existence (for different Zeldovich number, Ze), onset (as a function Da), and nature (i.e. mode, frequency, amplitude) of pulsating instabilities theoretically predicted to occur in transient spherical diffusion flames using fuel/diluent mixtures that are above a critical Lewis number.

**Approach.** A series of experiments is proposed in which mixtures of various gaseous fuels and diluents will be issued into an oxidizing environment through a spherical porous burner and ignited to obtain, nominally, a spherical, one-dimensional stabilized flame. Synchronized measurements are to be made including spectrally resolved images, flame and burner temperatures, radiative flux measurements, and system operating conditions (including reactant flow rates, ambient temperatures, pressures and acceleration levels, etc.). These data are to be used for comparisons of flame behavior and structure with detailed numerical simulations of the flames. Conventional gaseous fuels including hydrogen, methane, and ethylene will be used. Hydrogen is the simplest fuel and its reaction mechanism is also reasonably established. Methane is the simplest hydrocarbon and extensive studies have been conducted on its combustion chemistry. Ethylene is a typical sooty fuel and is also an important intermediate for the oxidation of higher hydrocarbons. Diluents mixed with fuel are to include nitrogen and helium to adjust mixture diffusivities, and carbon dioxide to influence flame radiation characteristics.

**Hypothesis.** The transient numerical simulation of spherical flames developed as part of this program includes detailed chemistry and transport models, especially radiation mechanisms. Each description of the flames obtained from the experiment, including measurements of aspects of the flame structure, growth or flame front velocities, and the specific test conditions where steady state flames, flame extinctions, flame front instabilities, soot suppression limits, etc., comprise a rigorous test of the detailed model. Together they provide a measure of the comprehensiveness of the chemical kinetic and transport models. The numerical simulation is also being used as a predictive tool to develop the science requirements for this experiment, especially the collection of test conditions and most aspects of the measurement systems. Due to time and g-jitter limitations, little of the planned test matrix can be adequately explored in the ground based test facilities, and the flight experiment definition will rely on the best effort in the modeling work.

**Research impacts / Earth benefits.** The impact of this work consists of both practical and fundamental aspects. Practically, with diffusion flame burning as the basis in many combustion engines and devices, understanding the underlying dynamics and chemistry of diffusion flames is important in improving performance in terms of power, efficiency, pollutant emissions, and reliability. Fundamentally, the unique buoyancy-free environment offered by microgravity affords simple aerodynamic flow fields to acquire diffusion flame data of high fidelity, with the prospect of understanding unit thermochemical processes as well as quantifying the associated physico-chemical parameters.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-23": { "by": "", "date": "", "hash": "15fe3325a1e7" },`
- Notes:

## PSI-107 SPICE: Smoke Point In Co-flow Experiment

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-107) · role: **fundamental** · fuel class: **gas** · numbers check: all found

> **Summary:** Gas-jet flames were lit in a flow duct in the station glovebox with a controlled coflow of air. Fuel flow was adjusted to find the smoke point, where the flame starts to emit soot. Flame lengths were recorded for several fuels and burner diameters. In total 526 flames were studied.
>
> **Why it matters:** Improves understanding of soot formation, which the record links to designing safer spacecraft environments.

<details><summary>PSI record text</summary>

**Objective.** The objective of SPICE is to better understand the complex process of combustion by observing flames in a microgravity environment aboard the International Space Station (ISS) and analogous ground experiments. Specific objectives were: (1) Identify the laminar smoke-point properties of non-buoyant jet diffusion flames under various co-flow conditions in microgravity. (2) Determine the effects of burner diameter and co-flow velocity on the luminous flame lengths and smoke points. (3) Quantify the sooting propensity of different fuels, such as ethylene, propane, and propylene mixtures. (4) Validate the correlation between luminous flame shape and residence time under microgravity conditions. (5) Investigate the impact of air and fuel flow rate variations on smoke point phenomena in space.

**Approach.** The experimental setup in the microgravity science glovebox consisted of an apparatus with a flow duct with integrated nozzles, cameras, and fuel delivery systems. Fuels tested included methane, ethylene, propane, propylene, and propylene mixtures. Each flame was ignited in a controlled co-flow air environment, with burner diameters of 0.41 mm, 0.76 mm, and 1.6 mm and co-flow velocities ranging from 5.4 cm/s to 65 cm/s. Fuel flow rates were adjusted to identify the smoke point, marked by the flame's transition to emitting soot. Data such as flame lengths were recorded using still and video cameras. Measurements included flame height, radiative heat losses, and co-flow air velocity distributions. In total 526 flames were studied.

**Hypothesis.** The research hypothesizes that by minimizing gravity-driven transport phenomena scientists can study the laminar smoke-point properties of non-buoyant jet diffusion flames. Flame properties are expected to differ significantly from those observed under normal gravity.

**Research impacts / Earth benefits.** (1) Will improve our understanding of soot formation mechanisms and help design safer spacecraft environments. (2) Will contribute to refining our computational models for predicting flame behaviors under non-buoyant conditions. (3) Will enhance our knowledge of soot generation (4) Could possibly provide insights to better fuel formulations and combustion processes.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-107": { "by": "", "date": "", "hash": "38cc3a09e44f" },`
- Notes:

## PSI-106 SLICE: Structure and Liftoff In Combustion Experiment

[PSI record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-106) · role: **fundamental** · fuel class: **gas** · numbers check: all found

> **Summary:** Gas flames were lit by hand in a fan-driven flow duct and photographed under controlled coflow air. The study looked at how flames stabilize at their base and when they lift off, and how diluting the fuel with nitrogen affects soot and stability.
>
> **Why it matters:** Insights into flame stability and soot that the record connects to fire safety and to better numerical models.

<details><summary>PSI record text</summary>

**Objective.** Objective: The objective of this investigation is to better understand the structure and stability of laminar diffusion flames in microgravity. Specific objectives of this investigation were: 1. To investigate the structure of laminar diffusion flames in microgravity to understand the stabilizing mechanisms at the flames base. 2. Determine the liftoff velocity limits for different fuels and burner diameters. 3. Evaluate the impact of fuel dilution with nitrogen on soot formation and flame stability. 4. Quantify the effects of microgravity on flame length and radiative heat loss compared to normal gravity conditions. 5. Validate numerical models for flame dynamics, soot production, and thermal radiation in non-premixed flames.

**Approach.** The SLICE apparatus consisted of a fan-driven flow duct, exchangeable burner tubes, and integrated sensors to measure flow rates and temperature. This setup used several fuels such as methane, ethylene, and nitrogen-diluted mixtures. Flames were then manually ignited and observed under controlled coflow air conditions. A high resolution camera captured still images while sensor data was overlaid on these images. Calibration tests for airflow velocity, soot measurement, and the fans were conducted to ensure the accuracy of the results. More than 4,000 high-resolution images were captured across 13 testing experiments. Data was then analyzed to correlate flame structure with stability with flow dynamics and fuel properties.

**Hypothesis.** The hypothesis is that the structure and stability of laminar diffusion flames in microgravity are significantly influenced by burner diameter, coflow velocity, and fuel composition and are fundamentally different than flames observed on Earth.

**Research impacts / Earth benefits.** 1. Improved numerical models for flame behavior lead to more efficient combustion technologies on Earth. 2. Understanding soot formation aids in designing combustion systems with minimum emissions. 3. Insights into flame stability and behavior to enhance fire safety. 4. Findings will inform the development of cleaner, more efficient engines and industrial burners.

</details>

- [ ] Approved. Line for `pipeline/reviews.json`: `"PSI-106": { "by": "", "date": "", "hash": "06c4d1acd890" },`
- Notes:
