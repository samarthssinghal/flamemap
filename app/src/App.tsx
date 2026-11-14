import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom'
import { loadData, type AppData } from './lib/data'
import type { Environment, Task, Weights } from './lib/types'
import Rank from './pages/Rank'
import EvidenceMap from './pages/EvidenceMap'
import Explorer from './pages/Explorer'
import Compare from './pages/Compare'
import About from './pages/About'

interface Ctx {
  data: AppData
  envId: string
  setEnvId: (id: string) => void
  custom: Environment
  setCustom: (e: Environment) => void
  env: Environment
  taskId: string
  setTaskId: (id: string) => void
  task: Task
  weights: Weights
  setWeights: (w: Weights) => void
  compare: string[]
  toggleCompare: (id: string) => void
}
const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => useContext(AppCtx) as Ctx

export const DISCLAIMER =
  'FlameMap is a student hackathon project and a research-navigation aid. It ranks how closely past NASA experiments match a chosen environment. It does not predict fire behavior, assess risk or certify safety, and it is not NASA guidance. Always consult the original PSI records and publications.'

export default function App() {
  const [data, setData] = useState<AppData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [envId, setEnvId] = useState('iss')
  const [taskId, setTaskId] = useState('prevent')
  const [weights, setWeights] = useState<Weights | null>(null)
  const [compare, setCompare] = useState<string[]>([])
  const [custom, setCustom] = useState<Environment>({ id: 'custom', name: 'Custom environment', o2_percent: 34, pressure_kpa: 56.5, gravity_g: 0.166, flow_cm_s: null, sources: [], note: 'Your own values.' })

  useEffect(() => {
    loadData().then(setData).catch((e) => setError(String(e.message ?? e)))
  }, [])

  const ctx = useMemo<Ctx | null>(() => {
    if (!data) return null
    const env = envId === 'custom' ? custom : (data.env.environments.find((e) => e.id === envId) ?? data.env.environments[0])
    const task = data.env.tasks.find((t) => t.id === taskId) ?? data.env.tasks[0]
    return {
      data, envId, setEnvId, custom, setCustom, env, taskId, setTaskId, task,
      weights: weights ?? data.env.default_weights, setWeights,
      compare,
      toggleCompare: (id) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id])),
    }
  }, [data, envId, custom, taskId, weights, compare])

  if (error) return <div className="center"><h1>FlameMap</h1><p role="alert">The data files could not be loaded. {error}</p></div>
  if (!ctx) return <div className="center"><p>Loading NASA PSI data…</p></div>

  return (
    <AppCtx.Provider value={ctx}>
      <HashRouter>
        <header className="top">
          <div className="brand">
            <span className="logo" aria-hidden="true" />
            <div>
              <strong>FlameMap</strong>
              <span className="tag">Fire-safety evidence ranker for crewed space environments</span>
            </div>
          </div>
          <nav aria-label="Main">
            <NavLink to="/" end>Rank</NavLink>
            <NavLink to="/map">Evidence map</NavLink>
            <NavLink to="/explorer">Explorer</NavLink>
            <NavLink to="/compare">Compare{compare.length ? ` (${compare.length})` : ''}</NavLink>
            <NavLink to="/about">Method and sources</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Rank />} />
            <Route path="/map" element={<EvidenceMap />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer>
          <p>{DISCLAIMER}</p>
          <p>
            Data: NASA Physical Sciences Informatics (PSI), snapshot {data!.insights.snapshot_date}. <NavLink to="/about">Method, limits and sources</NavLink>
          </p>
        </footer>
      </HashRouter>
    </AppCtx.Provider>
  )
}
