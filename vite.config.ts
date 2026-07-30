/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const wasmDir = path.resolve('node_modules/onnxruntime-web/dist')

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-ort-wasm',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? ''
          if (!url.startsWith('/wasm/')) return next()
          const filename = path.basename(url.split('?')[0])
          const filePath = path.join(wasmDir, filename)
          if (!fs.existsSync(filePath)) return next()
          const ext = path.extname(filename)
          const mime = ext === '.mjs' ? 'text/javascript' : ext === '.wasm' ? 'application/wasm' : 'application/octet-stream'
          res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' })
          fs.createReadStream(filePath).pipe(res)
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web']
  },
  test: {
    globals: true,
    environment: 'node'
  }
})
