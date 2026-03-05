import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import type { StageItem, StageItemType } from '../../../../shared/types'

type PaletteEntry = { type: StageItemType; tKey: string; icon: string }

const PALETTE_ITEMS: PaletteEntry[] = [
  { type: 'person', tKey: 'palette.performer', icon: '🎤' },
  { type: 'microphone', tKey: 'palette.microphone', icon: '🎙' },
  { type: 'guitar', tKey: 'palette.guitar', icon: '🎸' },
  { type: 'bass', tKey: 'palette.bass', icon: '🎸' },
  { type: 'keyboard', tKey: 'palette.keyboard', icon: '🎹' },
  { type: 'drums', tKey: 'palette.drums', icon: '🥁' },
  { type: 'percussion', tKey: 'palette.percussion', icon: '🪘' },
  { type: 'wind_trumpet', tKey: 'palette.windTrumpet', icon: '🎺' },
  { type: 'wind_trombone', tKey: 'palette.windTrombone', icon: '🎺' },
  { type: 'wind_saxophone', tKey: 'palette.windSaxophone', icon: '🎷' },
  { type: 'wind_flute', tKey: 'palette.windFlute', icon: '🪈' },
  { type: 'monitor', tKey: 'palette.monitor', icon: '📢' },
  { type: 'amp', tKey: 'palette.amp', icon: '🔊' },
  { type: 'di_box', tKey: 'palette.diBox', icon: '📦' },
  { type: 'speaker_main', tKey: 'palette.mainSpeaker', icon: '📯' },
  { type: 'generic', tKey: 'palette.generic', icon: '⬜' }
]

const SHAPE_ITEMS: PaletteEntry[] = [
  { type: 'rectangle', tKey: 'palette.rectangle', icon: '▭' },
  { type: 'circle', tKey: 'palette.circle', icon: '◯' }
]

const CABLE_ITEMS: PaletteEntry[] = [
  { type: 'cable_xlr', tKey: 'palette.cableXlr', icon: '〰' },
  { type: 'cable_trs', tKey: 'palette.cableTrs', icon: '〰' },
  { type: 'cable_ts', tKey: 'palette.cableTs', icon: '〰' },
  { type: 'cable_midi', tKey: 'palette.cableMidi', icon: '〰' },
  { type: 'cable_speakon', tKey: 'palette.cableSpeakon', icon: '〰' }
]

const ANNOTATION_ITEMS: PaletteEntry[] = [
  { type: 'text', tKey: 'palette.text', icon: 'T' }
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
  guitar: { w: 50, h: 80 },
  bass: { w: 50, h: 80 },
  wind_trumpet: { w: 60, h: 50 },
  wind_saxophone: { w: 50, h: 70 },
  wind_flute: { w: 40, h: 70 },
  wind_trombone: { w: 80, h: 50 },
  percussion: { w: 80, h: 80 },
  rectangle: { w: 100, h: 60 },
  circle: { w: 70, h: 70 },
  cable_xlr: { w: 100, h: 0 },
  cable_trs: { w: 100, h: 0 },
  cable_ts: { w: 100, h: 0 },
  cable_midi: { w: 100, h: 0 },
  cable_speakon: { w: 100, h: 0 },
  text: { w: 120, h: 30 }
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
  const filteredCables = CABLE_ITEMS.filter((item) => t(item.tKey).toLowerCase().includes(query))
  const filteredAnnotations = ANNOTATION_ITEMS.filter((item) =>
    t(item.tKey).toLowerCase().includes(query)
  )

  function handleAdd(type: StageItemType, label: string): void {
    if (!activeProject) return
    const size = DEFAULT_SIZES[type]
    const isCable =
      type === 'cable_xlr' ||
      type === 'cable_trs' ||
      type === 'cable_ts' ||
      type === 'cable_midi' ||
      type === 'cable_speakon'

    const extra: StageItem['extra'] = isCable
      ? { fromId: null, toId: null, x2: 120 + size.w, y2: 120 }
      : type === 'text'
        ? { fontSize: 16, fontStyle: 'normal' }
        : null

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
      extra,
      sort_order: Date.now()
    })
  }

  function renderSection(entries: PaletteEntry[], sectionKey: string): JSX.Element | null {
    if (!entries.length) return null
    return (
      <>
        <div className="flex items-center gap-2 px-1 pt-2 pb-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            {t(sectionKey)}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
        {entries.map(({ type, tKey, icon }) => {
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
    )
  }

  const hasNoResults =
    filtered.length === 0 &&
    filteredShapes.length === 0 &&
    filteredCables.length === 0 &&
    filteredAnnotations.length === 0

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
        {hasNoResults && (
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

        {renderSection(filteredShapes, 'palette.shapes')}
        {renderSection(filteredCables, 'palette.cables')}
        {renderSection(filteredAnnotations, 'palette.annotations')}
      </div>
    </aside>
  )
}
