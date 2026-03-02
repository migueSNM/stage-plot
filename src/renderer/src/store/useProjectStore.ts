import { create } from 'zustand'
import type { Project, StageItem } from '../../../shared/types'

const MAX_HISTORY = 50

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

  // Item actions
  addItem: (item: StageItem) => Promise<void>
  updateItem: (item: StageItem) => Promise<void>
  updateItemPosition: (id: string, x: number, y: number) => Promise<void>
  nudgeItem: (id: string, dx: number, dy: number) => Promise<void>
  deleteItem: (id: string) => Promise<void>
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

  registerExport: (fns) => set({ exportFns: fns }),

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

  deleteItem: async (id) => {
    get().pushHistory()
    await window.api.items.delete(id)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  },

  setItems: (items) => set({ items })
}))
