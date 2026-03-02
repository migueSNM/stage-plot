import { create } from 'zustand'
import type { Project, StageItem } from '../../../shared/types'

interface ProjectStore {
  projects: Project[]
  activeProject: Project | null
  items: StageItem[]
  isLoading: boolean

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

  loadProjects: async () => {
    set({ isLoading: true })
    const projects = await window.api.projects.list()
    set({ projects, isLoading: false })
  },

  openProject: async (id) => {
    const project = await window.api.projects.get(id)
    if (!project) return
    const items = await window.api.items.list(id)
    set({ activeProject: project, items })
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
      items: s.activeProject?.id === id ? [] : s.items
    }))
  },

  closeProject: () => {
    set({ activeProject: null, items: [] })
  },

  addItem: async (item) => {
    await window.api.items.save(item)
    set((s) => ({ items: [...s.items, item] }))
  },

  updateItem: async (item) => {
    await window.api.items.save(item)
    set((s) => ({ items: s.items.map((i) => (i.id === item.id ? item : i)) }))
  },

  updateItemPosition: async (id, x, y) => {
    const item = get().items.find((i) => i.id === id)
    if (!item) return
    const updated = { ...item, x, y }
    await window.api.items.save(updated)
    set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }))
  },

  deleteItem: async (id) => {
    await window.api.items.delete(id)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  },

  setItems: (items) => set({ items })
}))
