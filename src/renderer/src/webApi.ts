/**
 * Browser-compatible mock of window.api (normally injected by the Electron preload).
 * All DB/IPC calls are no-ops; in-memory Zustand state remains the source of truth.
 * File operations use browser APIs (Blob download, <input type="file"> picker).
 */
import type { StagePlotExportData } from '../../shared/types'

const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? '0.0.0'

function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', () => {
      document.body.removeChild(input)
      resolve(input.files?.[0] ?? null)
    })
    input.addEventListener('cancel', () => {
      document.body.removeChild(input)
      resolve(null)
    })
    input.click()
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const webApi: any = {
  platform: 'web',

  projects: {
    list:   async () => [],
    get:    async () => undefined,
    save:   async () => undefined,
    delete: async () => undefined
  },

  items: {
    list:            async () => [],
    save:            async () => undefined,
    saveMany:        async () => undefined,
    delete:          async () => undefined,
    deleteByProject: async () => undefined
  },

  files: {
    exportJson: async (data: StagePlotExportData) => {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `stage-plot-${data.project.name.replace(/[^a-z0-9]/gi, '_')}.json`
      a.click()
      URL.revokeObjectURL(url)
      return true
    },

    importJson: async (): Promise<StagePlotExportData | null> => {
      const file = await pickFile('.json,application/json')
      if (!file) return null
      try {
        return JSON.parse(await file.text()) as StagePlotExportData
      } catch {
        return null
      }
    },

    importImage: async (): Promise<string | null> => {
      const file = await pickFile('image/*')
      if (!file) return null
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(file)
      })
    }
  },

  background: {
    get: async () => ({
      imageData: null, locked: false,
      x: null, y: null, width: null, height: null
    }),
    set: async () => undefined
  },

  app: {
    getVersion:      async () => APP_VERSION,
    installUpdate:   async () => undefined,
    openReleases:    () => { window.open('https://github.com/migueSNM/stage-plot/releases', '_blank') },
    onUpdateAvailable: () => {},
    onUpdateDownloaded: () => {},
    onUpdateError:   () => {}
  }
}
