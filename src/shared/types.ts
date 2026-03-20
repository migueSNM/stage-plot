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
  // ── Legacy (kept for backward compat) ──────────────────────────────────────
  | 'guitar'
  | 'bass'
  | 'amp'
  | 'generic'
  | 'percussion'
  | 'rectangle'
  | 'circle'
  // ── People ─────────────────────────────────────────────────────────────────
  | 'person'
  // ── Guitars & Basses ───────────────────────────────────────────────────────
  | 'guitar_acoustic'
  | 'guitar_electric'
  | 'guitar_classical'
  | 'bass_electric'
  | 'bass_upright'
  // ── Amplifiers ─────────────────────────────────────────────────────────────
  | 'amp_combo'
  | 'amp_head'
  | 'amp_cab'
  | 'amp_bass'
  // ── Keyboards & Piano ──────────────────────────────────────────────────────
  | 'piano_grand'
  | 'piano_baby_grand'
  | 'piano_upright'
  | 'keyboard'
  | 'organ'
  // ── Drums & Percussion ─────────────────────────────────────────────────────
  | 'drums'
  | 'drums_electronic'
  | 'drums_kick'
  | 'drums_snare'
  | 'drums_hihat'
  | 'drums_cymbal'
  | 'cajon'
  | 'congas'
  | 'marimba'
  | 'timpani'
  // ── Horns & Winds ──────────────────────────────────────────────────────────
  | 'wind_trumpet'
  | 'wind_saxophone'
  | 'wind_flute'
  | 'wind_trombone'
  // ── Microphones ────────────────────────────────────────────────────────────
  | 'microphone'
  | 'mic_stand'
  | 'mic_overhead'
  // ── PA & Monitors ──────────────────────────────────────────────────────────
  | 'speaker_main'
  | 'subwoofer'
  | 'monitor'
  | 'monitor_sidefill'
  | 'monitor_iem'
  | 'di_box'
  // ── Stage & Environment ────────────────────────────────────────────────────
  | 'platform'
  | 'desk_foh'
  // ── Cables ─────────────────────────────────────────────────────────────────
  | 'cable_xlr'
  | 'cable_trs'
  | 'cable_ts'
  | 'cable_midi'
  | 'cable_speakon'
  // ── Annotations & Custom ───────────────────────────────────────────────────
  | 'text'
  | 'custom'

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
  'file:importImage': { args: []; return: string | null }
  'db:background:get': { args: [projectId: string]; return: { imageData: string | null; locked: boolean; x: number | null; y: number | null; width: number | null; height: number | null } }
  'db:background:set': { args: [projectId: string, imageData: string | null, locked: boolean, x: number | null, y: number | null, width: number | null, height: number | null]; return: void }
  'app:version': { args: []; return: string }
  'app:install-update': { args: []; return: void }
  'app:open-releases': { args: []; return: void }
}
