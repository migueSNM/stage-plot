import { create } from 'zustand'
import type { Project, StageItem } from '../../../shared/types'

const MAX_HISTORY = 50

const CABLE_TYPES = new Set([
  'cable_xlr',
  'cable_trs',
  'cable_ts',
  'cable_midi',
  'cable_speakon'
])

interface ExportFns {
  png: (() => void) | null
  pdf: (() => void) | null
}

interface ProjectStore {
  projects: Project[]
  activeProject: Project | null
  items: StageItem[]
  isLoading: boolean
  undoStack: StageItem[][]
  redoStack: StageItem[][]
  exportFns: ExportFns

  // Canvas view state
  canvasScale: number
  canvasPos: { x: number; y: number }
  clipboard: StageItem[]

  registerExport: (fns: ExportFns) => void

  // History
  pushHistory: () => void
  undo: () => Promise<void>
  redo: () => Promise<void>

  // Project actions
  loadProjects: () => Promise<void>
  openProject: (id: string) => Promise<void>
  createProject: (name: string, description?: string) => Promise<Project>
  saveProject: (project: Project) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  closeProject: () => void

  // Canvas view actions
  setCanvasScale: (scale: number) => void
  setCanvasPos: (pos: { x: number; y: number }) => void

  // Clipboard actions
  copySelected: (ids: string[]) => void
  pasteClipboard: () => Promise<string[]>

  // Item actions
  addItem: (item: StageItem) => Promise<void>
  updateItem: (item: StageItem) => Promise<void>
  updateItemPosition: (id: string, x: number, y: number) => Promise<void>
  nudgeItem: (id: string, dx: number, dy: number) => Promise<void>
  nudgeItems: (ids: string[], dx: number, dy: number) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  deleteItems: (ids: string[]) => Promise<void>
  setItems: (items: StageItem[]) => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProject: null,
  items: [],
  isLoading: false,
  undoStack: [],
  redoStack: [],
  exportFns: { png: null, pdf: null },
  canvasScale: 1.0,
  canvasPos: { x: 0, y: 0 },
  clipboard: [],

  registerExport: (fns) => set({ exportFns: fns }),

  // ── Canvas view ────────────────────────────────────────────────────────────

  setCanvasScale: (scale) => set({ canvasScale: scale }),
  setCanvasPos: (pos) => set({ canvasPos: pos }),

  // ── Clipboard ─────────────────────────────────────────────────────────────

  copySelected: (ids) => {
    const { items } = get()
    const selected = items.filter((i) => ids.includes(i.id))
    set({ clipboard: selected.map((i) => ({ ...i })) })
  },

  pasteClipboard: async () => {
    const { clipboard, activeProject } = get()
    if (!clipboard.length || !activeProject) return []
    get().pushHistory()
    const now_ts = Date.now()
    const newItems: StageItem[] = clipboard.map((item, idx) => {
      const extra =
        item.extra && CABLE_TYPES.has(item.type)
          ? {
              ...(item.extra as Record<string, unknown>),
              x2: ((item.extra as Record<string, unknown>).x2 as number) + 20,
              y2: ((item.extra as Record<string, unknown>).y2 as number) + 20,
              fromId: null,
              toId: null
            }
          : item.extra
      return {
        ...item,
        id: `${now_ts + idx}-${Math.random().toString(36).slice(2, 9)}`,
        x: item.x + 20,
        y: item.y + 20,
        extra,
        sort_order: now_ts + idx
      }
    })
    await window.api.items.saveMany(newItems)
    set((s) => ({ items: [...s.items, ...newItems] }))
    return newItems.map((i) => i.id)
  },

  // ── History ────────────────────────────────────────────────────────────────

  pushHistory: () => {
    const { items, undoStack } = get()
    set({
      undoStack: [...undoStack.slice(-(MAX_HISTORY - 1)), [...items]],
      redoStack: []
    })
  },

  undo: async () => {
    const { undoStack, redoStack, items, activeProject } = get()
    if (!undoStack.length || !activeProject) return
    const prev = undoStack[undoStack.length - 1]
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [[...items], ...redoStack.slice(0, MAX_HISTORY - 1)],
      items: prev
    })
    await window.api.items.deleteByProject(activeProject.id)
    if (prev.length) await window.api.items.saveMany(prev)
  },

  redo: async () => {
    const { undoStack, redoStack, items, activeProject } = get()
    if (!redoStack.length || !activeProject) return
    const next = redoStack[0]
    set({
      undoStack: [...undoStack.slice(-(MAX_HISTORY - 1)), [...items]],
      redoStack: redoStack.slice(1),
      items: next
    })
    await window.api.items.deleteByProject(activeProject.id)
    if (next.length) await window.api.items.saveMany(next)
  },

  // ── Projects ───────────────────────────────────────────────────────────────

  loadProjects: async () => {
    set({ isLoading: true })
    const projects = await window.api.projects.list()
    set({ projects, isLoading: false })
  },

  openProject: async (id) => {
    const project = await window.api.projects.get(id)
    if (!project) return
    const items = await window.api.items.list(id)
    set({ activeProject: project, items, undoStack: [], redoStack: [] })
  },

  createProject: async (name, description = '') => {
    const project: Project = {
      id: generateId(),
      name,
      description,
      created_at: now(),
      updated_at: now()
    }
    await window.api.projects.save(project)
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  saveProject: async (project) => {
    const updated = { ...project, updated_at: now() }
    await window.api.projects.save(updated)
    set((s) => ({
      projects: s.projects.map((p) => (p.id === updated.id ? updated : p)),
      activeProject: s.activeProject?.id === updated.id ? updated : s.activeProject
    }))
  },

  deleteProject: async (id) => {
    await window.api.projects.delete(id)
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeProject: s.activeProject?.id === id ? null : s.activeProject,
      items: s.activeProject?.id === id ? [] : s.items,
      undoStack: s.activeProject?.id === id ? [] : s.undoStack,
      redoStack: s.activeProject?.id === id ? [] : s.redoStack
    }))
  },

  closeProject: () => {
    set({ activeProject: null, items: [], undoStack: [], redoStack: [] })
  },

  // ── Items ──────────────────────────────────────────────────────────────────

  addItem: async (item) => {
    get().pushHistory()
    await window.api.items.save(item)
    set((s) => ({ items: [...s.items, item] }))
  },

  updateItem: async (item) => {
    get().pushHistory()
    await window.api.items.save(item)
    set((s) => ({ items: s.items.map((i) => (i.id === item.id ? item : i)) }))
  },

  updateItemPosition: async (id, x, y) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return
    get().pushHistory()
    const updated = { ...item, x, y }
    await window.api.items.save(updated)
    set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }))
  },

  // Move by delta without pushing history — used for held arrow key nudges
  nudgeItem: async (id, dx, dy) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return
    const updated = { ...item, x: item.x + dx, y: item.y + dy }
    await window.api.items.save(updated)
    set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }))
  },

  // Move multiple items by delta without pushing history
  nudgeItems: async (ids, dx, dy) => {
    const { items } = get()
    const updated = items.map((i) => {
      if (!ids.includes(i.id)) return i
      const base = { ...i, x: i.x + dx, y: i.y + dy }
      // For cables, also move the free endpoint coordinates
      if (CABLE_TYPES.has(i.type) && i.extra) {
        const ex = i.extra as { fromId: string | null; toId: string | null; x2: number; y2: number }
        return { ...base, extra: { ...ex, x2: ex.x2 + dx, y2: ex.y2 + dy } }
      }
      return base
    })
    const toSave = updated.filter((i) => ids.includes(i.id))
    if (toSave.length) await window.api.items.saveMany(toSave)
    set({ items: updated })
  },

  deleteItem: async (id) => {
    get().pushHistory()
    await window.api.items.delete(id)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  },

  deleteItems: async (ids) => {
    if (!ids.length) return
    get().pushHistory()
    for (const id of ids) {
      await window.api.items.delete(id)
    }
    set((s) => ({ items: s.items.filter((i) => !ids.includes(i.id)) }))
  },

  setItems: (items) => set({ items })
}))
