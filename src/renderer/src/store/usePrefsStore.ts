import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'

export interface CustomItemDef {
  id: string
  label: string
  emoji: string
  color: string | null
}

interface PrefsStore {
  theme: 'dark' | 'light'
  language: 'en' | 'es'
  customItems: CustomItemDef[]
  setTheme: (theme: 'dark' | 'light') => void
  setLanguage: (lang: 'en' | 'es') => void
  addCustomItem: (def: Omit<CustomItemDef, 'id'>) => void
  updateCustomItem: (id: string, updates: Partial<Omit<CustomItemDef, 'id'>>) => void
  deleteCustomItem: (id: string) => void
}

export const usePrefsStore = create(
  persist<PrefsStore>(
    (set) => ({
      theme: 'dark',
      language: 'en',
      customItems: [],

      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme
        set({ theme })
      },

      setLanguage: (language) => {
        i18n.changeLanguage(language)
        set({ language })
      },

      addCustomItem: (def) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        set((s) => ({ customItems: [...s.customItems, { ...def, id }] }))
      },

      updateCustomItem: (id, updates) => {
        set((s) => ({
          customItems: s.customItems.map((c) => (c.id === id ? { ...c, ...updates } : c))
        }))
      },

      deleteCustomItem: (id) => {
        set((s) => ({ customItems: s.customItems.filter((c) => c.id !== id) }))
      }
    }),
    {
      name: 'stage-plot-prefs',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        document.documentElement.dataset.theme = state.theme
        i18n.changeLanguage(state.language)
      }
    }
  )
)
