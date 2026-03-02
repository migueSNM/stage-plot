import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import type { StageItemType } from '../../../../shared/types'

type PaletteEntry = { type: StageItemType; tKey: string; icon: string }

const PALETTE_ITEMS: PaletteEntry[] = [
  { type: 'person', tKey: 'palette.performer', icon: '🎤' },
  { type: 'microphone', tKey: 'palette.microphone', icon: '🎙' },
  { type: 'monitor', tKey: 'palette.monitor', icon: '📢' },
  { type: 'amp', tKey: 'palette.amp', icon: '🔊' },
  { type: 'keyboard', tKey: 'palette.keyboard', icon: '🎹' },
  { type: 'drums', tKey: 'palette.drums', icon: '🥁' },
  { type: 'di_box', tKey: 'palette.diBox', icon: '📦' },
  { type: 'speaker_main', tKey: 'palette.mainSpeaker', icon: '📯' },
  { type: 'generic', tKey: 'palette.generic', icon: '⬜' }
]

const SHAPE_ITEMS: PaletteEntry[] = [
  { type: 'rectangle', tKey: 'palette.rectangle', icon: '▭' },
  { type: 'circle', tKey: 'palette.circle', icon: '◯' }
]

const DEFAULT_SIZES: Record<StageItemType, { w: number; h: number }> = {
  person: { w: 60, h: 60 },
  microphone: { w: 40, h: 40 },
  monitor: { w: 80, h: 50 },
  amp: { w: 70, h: 70 },
  keyboard: { w: 120, h: 40 },
  drums: { w: 100, h: 100 },
  di_box: { w: 50, h: 50 },
  speaker_main: { w: 60, h: 80 },
  generic: { w: 60, h: 60 },
  rectangle: { w: 100, h: 60 },
  circle: { w: 70, h: 70 }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ItemPalette(): JSX.Element {
  const { t } = useTranslation()
  const { activeProject, addItem } = useProjectStore()
  const [search, setSearch] = useState('')

  const query = search.toLowerCase()
  const filtered = PALETTE_ITEMS.filter((item) => t(item.tKey).toLowerCase().includes(query))
  const filteredShapes = SHAPE_ITEMS.filter((item) => t(item.tKey).toLowerCase().includes(query))

  function handleAdd(type: StageItemType, label: string): void {
    if (!activeProject) return
    const size = DEFAULT_SIZES[type]
    addItem({
      id: generateId(),
      project_id: activeProject.id,
      type,
      label,
      x: 120,
      y: 120,
      rotation: 0,
      width: size.w,
      height: size.h,
      color: null,
      extra: null,
      sort_order: Date.now()
    })
  }

  return (
    <aside className="w-52 flex-shrink-0 bg-surface border-r border-border flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-border flex flex-col gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted px-1">
          {t('palette.title')}
        </h2>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('palette.search')}
            className="w-full bg-surface-2 rounded-md pl-7 pr-7 py-1.5 text-xs outline-none
                       border border-border focus:border-accent placeholder:text-muted/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {filtered.length === 0 && filteredShapes.length === 0 && (
          <p className="text-muted text-xs text-center py-6">{t('palette.noMatch')}</p>
        )}
        {filtered.map(({ type, tKey, icon }) => {
          const label = t(tKey)
          return (
            <button
              key={type}
              disabled={!activeProject}
              onClick={() => handleAdd(type, label)}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-left
                         hover:bg-surface-2 active:scale-95 disabled:opacity-30
                         disabled:cursor-not-allowed transition-all"
            >
              <span className="text-xl leading-none w-6 text-center">{icon}</span>
              <span className="text-[13px]">{label}</span>
            </button>
          )
        })}

        {filteredShapes.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-1 pt-2 pb-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {t('palette.shapes')}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {filteredShapes.map(({ type, tKey, icon }) => {
              const label = t(tKey)
              return (
                <button
                  key={type}
                  disabled={!activeProject}
                  onClick={() => handleAdd(type, label)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-left
                             hover:bg-surface-2 active:scale-95 disabled:opacity-30
                             disabled:cursor-not-allowed transition-all"
                >
                  <span className="text-xl leading-none w-6 text-center">{icon}</span>
                  <span className="text-[13px]">{label}</span>
                </button>
              )
            })}
          </>
        )}
      </div>
    </aside>
  )
}
