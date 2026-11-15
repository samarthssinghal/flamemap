import { DISCLAIMER, useApp } from '../App'

export default function About() {
  const { data } = useApp()
  const { insights: ins, sources, earth, env } = data
  const w = env.default_weights
  return (
    <div className="prose">
      <div className="hero">
        <h1>Method, limits and sources</h1>
        <p>What FlameMap does, how the numbers are produced, and what it cannot tell you.</p>
      </div>
      <section className="panel">
        <h2>What this is</h2>
        <p>NASA's Physical Sciences Informatics (PSI) database holds decades of microgravity combustion experiments. FlameMap reads {ins.n_investigations} flight investigations from it and answers one question: for a given crewed environment and fire-safety task, which experiments were run under the closest conditions, and where is there no evidence?</p>
        <p className="callout">{DISCLAIMER}</p>
      </section>
      <section className="panel">
        <h2>Data</h2>
        <ul>
          <li>Source: <a href="https://psi.nasa.gov/physci/repo/search?q=combustion" target="_blank" rel="noreferrer">PSI Data Repository, combustion science</a>, read on {ins.snapshot_date}.</li>
          <li>From each record we use the description text and the "Experimental table" files: {ins.n_table_rows.toLocaleString()} table rows in total. {ins.n_run_points.toLocaleString()} runs record both oxygen and pressure and appear on the evidence map.</li>
          <li>Units were converted to percent oxygen by volume and kPa (mmHg × 0.133322, atm × 101.325, bar × 100, mole fraction × 100).</li>
          <li>Every condition carries its source and a confidence label: "from data table", "from record text" or "assumed".</li>
          <li>Five related modeling studies in PSI are linked from their parent investigations but are not ranked. Two search results that are not combustion studies were excluded.</li>
        </ul>
      </section>
      <section className="panel">
        <h2>How the ranking works</h2>
        <p>The ranking is plain arithmetic, so every result can be checked by hand.</p>
        <ol>
          <li>For oxygen, pressure and airflow: if the environment value lies inside the tested range, the distance is 0. Otherwise it is the gap to the nearest end of the range, divided by a reference span (oxygen {env.reference_spans.o2_percent} points, pressure {env.reference_spans.pressure_kpa} kPa, airflow {env.reference_spans.flow_cm_s} cm/s), capped at 1.</li>
          <li>Gravity distance is the difference in g between the environment and the nearest gravity level tested.</li>
          <li>Task fit = 0.6 × role match + 0.4 × fuel-type match. Role match is 1 for the primary role, 0.5 for a secondary role and 0.25 for fundamental studies.</li>
          <li>Match = 100 × (1 − weighted average distance). Default weights: oxygen {w.o2}, pressure {w.pressure}, airflow {w.flow}, gravity {w.gravity}, task fit {w.task}. You can change them.</li>
          <li>If the investigation did not record a factor the environment sets, that factor counts as untested (distance 1, the maximum): a value that was not recorded is no evidence that the condition was tested, so missing data never raises a score. Where an experiment ran in station or Cygnus cabin air and its table has no oxygen or pressure column, about 21% O2 and 101.3 kPa are assumed and labeled "assumed". A factor the environment does not set (for example airflow on most presets) is left out for every investigation, and the other weights are rescaled. Each card says how many factors were recorded.</li>
        </ol>
      </section>
      <section className="panel">
        <h2>Where AI is used</h2>
        <ul>
          <li>AI helped read the PSI record text to fill in fuels, geometry, sensors and the variables each study changed, and drafted the short summaries. These are labeled in the app.</li>
          <li>The summaries use only the text of the PSI record. A team review of every summary is still pending for this build.</li>
          <li>Key findings were written with Claude Code from three sources only: NASA&apos;s Researcher&apos;s Guide to ISS Combustion Science (2015), the PSI record text and the PSI experimental tables. Each finding carries its exact quote or table cells, and the build fails if a quote, cell value or number does not match the source. Findings are labeled &quot;NASA-stated&quot;, &quot;NASA context&quot;, &quot;Stated in the PSI record&quot;, &quot;Data limitation&quot; or &quot;From the PSI data table&quot;.</li>
          <li>The &quot;What the evidence says&quot; briefs, the answers on &quot;Ask the evidence&quot; and the &quot;Studies like this one&quot; reasons were written by AI from the computed rankings, gaps and checked findings, and nothing else. Every sentence cites its sources. When the site is built, a script fails the build if a sentence has a number not found in what it cites, names a study it does not cite, or calls a study &quot;closest evidence&quot; when it is not in the computed top five. Ask the evidence only matches your question to these checked answers; it never generates new text in your browser.</li>
          <li>The ranking, gap statements and chart counts are computed from the data. No AI model produces a score.</li>
          <li>AI coding assistants helped write the software.</li>
        </ul>
      </section>
      <section className="panel">
        <h2>Limits</h2>
        <ul>
          <li>A tested range is summarized as lowest-to-highest. Not every combination inside a range was tested.</li>
          <li>Where a table has no pressure column and the experiment ran in cabin or module air, about 1 atm (101.3 kPa) is assumed and labeled.</li>
          <li>PSI has no partial-gravity combustion data in these records, so the gravity factor is a flag, not physics.</li>
          <li>Role and fuel-type labels are our classification, guided by the challenge statement.</li>
          <li>Table row counts are not always equal to the number of burns: some tables include note rows or list several conditions in one row.</li>
          <li>Rocket and propellant fire safety is outside the scope of this data.</li>
          <li>The data is a snapshot from {ins.snapshot_date}; PSI records change over time.</li>
        </ul>
      </section>
      <section className="panel">
        <h2>Why it matters, on Earth too</h2>
        <div className="tiles">
          {earth.spinoffs.map((s) => <a key={s.url} className="tile" href={s.url} target="_blank" rel="noreferrer"><b>{s.title}</b><span className="dim">NASA spin-off, {s.era}</span><span>{s.blurb}</span></a>)}
          {earth.history.map((s) => <a key={s.url} className="tile" href={s.url} target="_blank" rel="noreferrer"><b>{s.title}</b><span className="dim">NASA history</span><span>{s.blurb}</span></a>)}
        </div>
      </section>
      <section className="panel">
        <h2>Sources</h2>
        <p>PSI asks users to cite investigations by DOI. All records used:</p>
        <div className="table-wrap">
          <table className="grid">
            <thead><tr><th>PSI ID</th><th>Investigation</th><th>DOI</th><th>License</th><th>Used as</th></tr></thead>
            <tbody>
              {sources.psi.map((s) => (
                <tr key={s.psi_id}><td><a href={s.url} target="_blank" rel="noreferrer">{s.psi_id}</a></td><td>{s.acronym ? <b>{s.acronym}: </b> : null}{s.title}</td><td><a href={`https://doi.org/${s.doi}`} target="_blank" rel="noreferrer">{s.doi}</a></td><td>{s.license}</td><td>{s.used_as}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul>{sources.other.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
      </section>
    </div>
  )
}
