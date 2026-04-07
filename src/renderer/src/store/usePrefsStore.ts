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
  language: 'en' | 'es'
  customItems: CustomItemDef[]
  setLanguage: (lang: 'en' | 'es') => void
  addCustomItem: (def: Omit<CustomItemDef, 'id'>) => void
  updateCustomItem: (id: string, updates: Partial<Omit<CustomItemDef, 'id'>>) => void
  deleteCustomItem: (id: string) => void
}

// Always light mode
document.documentElement.dataset.theme = 'light'

export const usePrefsStore = create(
  persist<PrefsStore>(
    (set) => ({
      language: 'en',
      customItems: [],

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
        document.documentElement.dataset.theme = 'light'
        i18n.changeLanguage(state.language)
      }
    }
  )
)
