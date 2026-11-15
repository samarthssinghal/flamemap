import { Link } from 'react-router-dom'
import { useApp } from '../App'
import type { Cited } from '../lib/types'

/** One citation: a PSI investigation, a checked finding, a computed gap, environment values or a computed statistic. */
function Cite({ c, envId }: { c: string; envId?: string }) {
  const { data } = useApp()
  if (c.startsWith('PSI-')) {
    const inv = data.investigations.find((i) => i.psi_id === c)
    return <Link className="cite" to={`/explorer?open=${c}`} title={inv ? `${inv.title} (${c})` : c}>{inv?.acronym ?? c}</Link>
  }
  if (/^F\d+$/.test(c)) {
    const f = data.findings.find((x) => x.id === c)
    if (!f) return null
    const where = f.source.type === 'nasa_guide' ? `NASA Guide p. ${f.source.page}` : f.source.type === 'psi_text' ? 'PSI record text' : 'PSI data table'
    const href = f.source.page ? `${f.source.url}#page=${f.source.page}` : f.source.url
    return <a className="cite" href={href} target="_blank" rel="noreferrer" title={`${f.text}${f.quote ? `\n\nSource: “${f.quote}”` : ''}`}>{where}</a>
  }
  if (c.startsWith('gap:')) {
    const [e, id] = c.slice(4).includes('/') ? c.slice(4).split('/') : [envId, c.slice(4)]
    const g = data.gaps.find((x) => x.environment_id === e)?.gaps.find((x) => x.id === id)
    return <span className="cite calc" title={g ? `${g.text}\nComputed from: ${g.computed_from.metric} = ${g.computed_from.value}` : c} tabIndex={0}>computed gap</span>
  }
  if (c === 'env' || c.startsWith('env:')) return <span className="cite calc" title="Environment values and their sources (shown in the environment picker)" tabIndex={0}>environment</span>
  if (c.startsWith('stat:')) return <span className="cite calc" title={`Computed from the PSI tables: ${c.slice(5).replace(/_/g, ' ')}`} tabIndex={0}>computed from PSI tables</span>
  return null
}

export function Cites({ cites, envId }: { cites: string[]; envId?: string }) {
  return <span className="cites">{cites.map((c) => <Cite key={c} c={c} envId={envId} />)}</span>
}

export function CitedText({ s, envId }: { s: Cited; envId?: string }) {
  return <>{s.text} <Cites cites={s.cites} envId={envId} /></>
}

/** Label shown under every block of AI-written text. */
export function AiNote({ what }: { what: string }) {
  const { data } = useApp()
  return (
    <p className="ai-note">
      {what} written by AI with {data.ai.generated_with.split(',')[0]} from the computed rankings, gaps and checked findings. Every number, named study and citation is checked against that data when the site is built. {data.ai.human_reviewed ? 'Reviewed by the team.' : 'Not yet reviewed by a person.'} Follow the citations before relying on it.
    </p>
  )
}
