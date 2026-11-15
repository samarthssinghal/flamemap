// Loads the sentence-embedding model in the visitor's browser, from files the site hosts itself
// (copied there by pipeline/embed.mjs). No third-party request, no API key, no text generation:
// the model turns the question into a vector, which is compared with the precomputed vectors.
import { decodeVectors, type VectorFile, type VectorItem } from './match'

export interface SemanticIndex { embed: (q: string) => Promise<Float32Array>; items: VectorItem[]; model: string }
export type SemanticState = 'idle' | 'loading' | 'ready' | 'failed'

let loading: Promise<SemanticIndex | null> | null = null
let state: SemanticState = 'idle'
const listeners = new Set<(s: SemanticState) => void>()
const setState = (s: SemanticState) => { state = s; listeners.forEach((f) => f(s)) }

export const semanticState = () => state
export function onSemanticState(f: (s: SemanticState) => void) { listeners.add(f); return () => { listeners.delete(f) } }

/** Starts loading (once) and resolves to the index, or null if it cannot load; callers then use keyword matching. */
export function loadSemantic(): Promise<SemanticIndex | null> {
  if (loading) return loading
  setState('loading')
  loading = (async () => {
    try {
      const base = new URL('./', document.baseURI).href
      const [file, tf] = await Promise.all([
        fetch(`${base}data/qa_vectors.json`).then((r) => { if (!r.ok) throw new Error(`qa_vectors.json ${r.status}`); return r.json() as Promise<VectorFile> }),
        import('@huggingface/transformers'),
      ])
      tf.env.allowRemoteModels = false
      tf.env.allowLocalModels = true
      // A path, not a full URL: transformers.js 4.3 skips its file-exists check for local models given as URLs,
      // and would then load the model without its tokenizer.
      tf.env.localModelPath = new URL('models/', base).pathname
      const wasm = tf.env.backends.onnx.wasm
      if (wasm) wasm.wasmPaths = { mjs: `${base}ort/ort-wasm-simd-threaded.mjs`, wasm: `${base}ort/ort-wasm-simd-threaded.wasm` }
      const extract = await tf.pipeline('feature-extraction', file.model, { dtype: file.dtype as 'q8', device: 'wasm' })
      const embed = async (q: string) => (await extract(q, { pooling: 'mean', normalize: true })).data as Float32Array
      await embed('warm up')
      setState('ready')
      return { embed, items: decodeVectors(file), model: file.model }
    } catch (e) {
      console.warn('Semantic search unavailable; using keyword matching.', e)
      setState('failed')
      return null
    }
  })()
  return loading
}
