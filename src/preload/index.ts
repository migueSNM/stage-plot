import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannels, StagePlotExportData } from '../shared/types'

// Type-safe IPC invoke helper
function invoke<K extends keyof IpcChannels>(
  channel: K,
  ...args: IpcChannels[K]['args']
): Promise<IpcChannels[K]['return']> {
  return ipcRenderer.invoke(channel, ...args)
}

const api = {
  platform: process.platform as NodeJS.Platform,
  projects: {
    list: () => invoke('db:projects:list'),
    get: (id: string) => invoke('db:projects:get', id),
    save: (project: Parameters<typeof invoke<'db:projects:save'>>[1]) =>
      invoke('db:projects:save', project),
    delete: (id: string) => invoke('db:projects:delete', id)
  },
  items: {
    list: (projectId: string) => invoke('db:items:list', projectId),
    save: (item: Parameters<typeof invoke<'db:items:save'>>[1]) => invoke('db:items:save', item),
    saveMany: (items: Parameters<typeof invoke<'db:items:saveMany'>>[1]) =>
      invoke('db:items:saveMany', items),
    delete: (id: string) => invoke('db:items:delete', id),
    deleteByProject: (projectId: string) => invoke('db:items:deleteByProject', projectId)
  },
  files: {
    exportJson: (data: StagePlotExportData) => invoke('file:exportJson', data),
    importJson: () => invoke('file:importJson')
  },
  app: {
    getVersion: () => invoke('app:version'),
    checkUpdate: () => invoke('app:check-update'),
    openReleasePage: (url: string) => invoke('app:open-release-page', url)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type API = typeof api
