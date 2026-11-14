import type { Finding, Investigation } from '../lib/types'

const KIND_LABEL: Record<Finding['kind'], string> = {
  nasa_stated: 'NASA-stated finding',
  nasa_context: 'NASA context',
  from_data: 'From the PSI data table',
}

const sourceHref = (f: Finding) => (f.source.page ? `${f.source.url}#page=${f.source.page}` : f.source.url)

/** Key findings for one investigation. `compact` shows only the finding and its source (for Compare). */
export default function Findings({ inv, compact = false }: { inv: Investigation; compact?: boolean }) {
  if (inv.findings.length === 0) {
    return <p className="dim">No findings yet. Neither the PSI record nor NASA&apos;s Researcher&apos;s Guide states a result for this study; see its publications.</p>
  }
  if (compact) {
    return (
      <ul className="findings compact">
        {inv.findings.map((f) => (
          <li key={f.text}>{f.text} <a className="dim src" href={sourceHref(f)} target="_blank" rel="noreferrer">({f.source.type === 'nasa_guide' ? `Guide p. ${f.source.page}` : 'PSI table'})</a></li>
        ))}
      </ul>
    )
  }
  return (
    <>
      <ul className="findings">
        {inv.findings.map((f) => (
          <li key={f.text}>
            <span className={`chip k-${f.kind}`}>{KIND_LABEL[f.kind]}</span> {f.text}
            <details>
              <summary>Source</summary>
              {f.quote && <blockquote>“{f.quote}”</blockquote>}
              {f.cells.length > 0 && (
                <ul className="cells">{f.cells.map((c) => <li key={c.row + c.column}>Row {c.row} · {c.column}: <b>{c.value}</b></li>)}</ul>
              )}
              <p className="dim src"><a href={sourceHref(f)} target="_blank" rel="noreferrer">{f.source.label}</a></p>
              {f.attribution_note && <p className="dim src">{f.attribution_note}</p>}
            </details>
          </li>
        ))}
      </ul>
      <p className="ai-note">Finding text written with Claude Code from the quoted source. Every quote, table cell and number is checked against the source when the site is built. Check the source before relying on it.</p>
    </>
  )
}
