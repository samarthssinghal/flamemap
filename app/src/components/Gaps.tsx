import { useApp } from '../App'

/** Computed evidence gaps for the selected preset environment (plain arithmetic, no AI). */
export default function Gaps({ title = 'Evidence gaps for this environment' }: { title?: string }) {
  const { data, envId } = useApp()
  const all = data.gaps.find((g) => g.environment_id === envId)?.gaps ?? []
  const gaps = all.filter((g) => g.severity !== 'info')
  const info = all.filter((g) => g.severity === 'info')
  return (
    <>
      {gaps.length > 0 && (
        <section className="gaps" aria-label="Evidence gaps">
          <h2>{title}</h2>
          <ul>{gaps.map((g) => <li key={g.id}><span className="gap-ico" aria-hidden="true">!</span><span>{g.text} <span className="dim">Computed from: {g.computed_from.metric} = {String(g.computed_from.value)}.</span></span></li>)}</ul>
        </section>
      )}
      {info.map((g) => <p key={g.id} className="info">{g.text}</p>)}
      {envId === 'custom' && <p className="info">Gap statements are precomputed for the preset environments. For a custom environment, read the per-factor results on each card of the ranking and the evidence map.</p>}
    </>
  )
}
