import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'

interface PrefsStore {
  theme: 'dark' | 'light'
  language: 'en' | 'es'
  setTheme: (theme: 'dark' | 'light') => void
  setLanguage: (lang: 'en' | 'es') => void
}

export const usePrefsStore = create(
  persist<PrefsStore>(
    (set) => ({
      theme: 'dark',
      language: 'en',

      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme
        set({ theme })
      },

      setLanguage: (language) => {
        i18n.changeLanguage(language)
        set({ language })
      }
    }),
    {
      name: 'stage-plot-prefs',
      // Apply persisted preferences as soon as the store rehydrates
      onRehydrateStorage: () => (state) => {
        if (!state) return
        document.documentElement.dataset.theme = state.theme
        i18n.changeLanguage(state.language)
      }
    }
  )
)
