import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    // onnxruntime-web references its own WebAssembly build, so Vite would ship a second, unused 27 MB copy.
    // The site loads the runtime from ort/ (copied there by pipeline/embed.mjs; see lib/semantic.ts).
    { name: 'drop-bundled-ort-wasm', generateBundle(_, bundle) { for (const k of Object.keys(bundle)) if (/ort-wasm[^/]*\.wasm$/.test(k)) delete bundle[k] } },
  ],
  test: { environment: 'node' },
})
