import { resolve } from 'path'
import { renameSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

/**
 * Vite config for the browser-only demo build.
 * Output: dist-web/
 * Entry:  src/renderer/index.web.html → src/renderer/src/main.web.tsx
 *
 * Differences from the Electron renderer build:
 *  - No electron-vite wrapper
 *  - base: './' for GitHub Pages compatibility
 *  - VITE_DEMO_MODE, VITE_DEMO_TOKEN, VITE_DEMO_EXPIRES_AT injected at build time
 */
export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),

  // Relative base path so the app works at any GitHub Pages sub-path
  base: './',

  plugins: [
    react(),
    // Rename output index.web.html → index.html so GitHub Pages serves it correctly
    {
      name: 'rename-html-output',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist-web')
        try {
          renameSync(`${outDir}/index.web.html`, `${outDir}/index.html`)
        } catch {
          // already named correctly or file doesn't exist — safe to ignore
        }
      }
    }
  ],

  // Bake the version from package.json into the bundle.
  // This means every release automatically gets the right version without
  // relying on the CI tag name or a manually set env var.
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version)
  },

  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@shared':   resolve(__dirname, 'src/shared')
    }
  },

  build: {
    outDir:    resolve(__dirname, 'dist-web'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.web.html')
    }
  }
})
