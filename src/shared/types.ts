// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

// ─── Stage Items ──────────────────────────────────────────────────────────────

export type StageItemType =
  | 'microphone'
  | 'monitor'
  | 'amp'
  | 'keyboard'
  | 'drums'
  | 'di_box'
  | 'speaker_main'
  | 'person'
  | 'generic'
  | 'rectangle'
  | 'circle'
  | 'cable_xlr'
  | 'cable_trs'
  | 'cable_ts'
  | 'cable_midi'
  | 'cable_speakon'
  | 'text'

export interface StageItem {
  id: string
  project_id: string
  type: StageItemType
  label: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
  color: string | null
  extra: Record<string, unknown> | null
  sort_order: number
}

// ─── Update check ─────────────────────────────────────────────────────────────

export interface UpdateInfo {
  version: string
  url: string
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export interface StagePlotExportData {
  version: number
  project: Project
  items: StageItem[]
}

// ─── IPC Channel map (for type-safe IPC) ─────────────────────────────────────

export interface IpcChannels {
  'db:projects:list': { args: []; return: Project[] }
  'db:projects:get': { args: [id: string]; return: Project | undefined }
  'db:projects:save': { args: [project: Project]; return: Project }
  'db:projects:delete': { args: [id: string]; return: void }
  'db:items:list': { args: [projectId: string]; return: StageItem[] }
  'db:items:save': { args: [item: StageItem]; return: StageItem }
  'db:items:saveMany': { args: [items: StageItem[]]; return: void }
  'db:items:delete': { args: [id: string]; return: void }
  'db:items:deleteByProject': { args: [projectId: string]; return: void }
  'file:exportJson': { args: [data: StagePlotExportData]; return: boolean }
  'file:importJson': { args: []; return: StagePlotExportData | null }
  'app:version': { args: []; return: string }
  'app:check-update': { args: []; return: UpdateInfo | null }
  'app:open-release-page': { args: [url: string]; return: void }
}
