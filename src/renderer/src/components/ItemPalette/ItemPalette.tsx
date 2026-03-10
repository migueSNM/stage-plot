import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import { usePrefsStore, type CustomItemDef } from '../../store/usePrefsStore'
import { ICON_PATHS } from '../../assets/icons/iconPaths'
import type { StageItem, StageItemType } from '../../../../shared/types'

type PaletteEntry = { type: StageItemType; tKey: string; iconKey: string }

const PALETTE_ITEMS: PaletteEntry[] = [
  { type: 'person', tKey: 'palette.performer', iconKey: 'person' },
  { type: 'microphone', tKey: 'palette.microphone', iconKey: 'microphone' },
  { type: 'guitar', tKey: 'palette.guitar', iconKey: 'guitar' },
  { type: 'bass', tKey: 'palette.bass', iconKey: 'bass' },
  { type: 'keyboard', tKey: 'palette.keyboard', iconKey: 'keyboard' },
  { type: 'drums', tKey: 'palette.drums', iconKey: 'drums' },
  { type: 'percussion', tKey: 'palette.percussion', iconKey: 'percussion' },
  { type: 'wind_trumpet', tKey: 'palette.windTrumpet', iconKey: 'wind_trumpet' },
  { type: 'wind_trombone', tKey: 'palette.windTrombone', iconKey: 'wind_trombone' },
  { type: 'wind_saxophone', tKey: 'palette.windSaxophone', iconKey: 'wind_saxophone' },
  { type: 'wind_flute', tKey: 'palette.windFlute', iconKey: 'wind_flute' },
  { type: 'monitor', tKey: 'palette.monitor', iconKey: 'monitor' },
  { type: 'amp', tKey: 'palette.amp', iconKey: 'amp' },
  { type: 'di_box', tKey: 'palette.diBox', iconKey: 'di_box' },
  { type: 'speaker_main', tKey: 'palette.mainSpeaker', iconKey: 'speaker_main' },
  { type: 'generic', tKey: 'palette.generic', iconKey: 'generic' }
]

const SHAPE_ITEMS: PaletteEntry[] = [
  { type: 'rectangle', tKey: 'palette.rectangle', iconKey: 'rectangle' },
  { type: 'circle', tKey: 'palette.circle', iconKey: 'circle' }
]

const CABLE_ITEMS: PaletteEntry[] = [
  { type: 'cable_xlr', tKey: 'palette.cableXlr', iconKey: 'cable' },
  { type: 'cable_trs', tKey: 'palette.cableTrs', iconKey: 'cable' },
  { type: 'cable_ts', tKey: 'palette.cableTs', iconKey: 'cable' },
  { type: 'cable_midi', tKey: 'palette.cableMidi', iconKey: 'cable' },
  { type: 'cable_speakon', tKey: 'palette.cableSpeakon', iconKey: 'cable' }
]

const ANNOTATION_ITEMS: PaletteEntry[] = [
  { type: 'text', tKey: 'palette.text', iconKey: 'text' }
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
  text: { w: 120, h: 30 },
  custom: { w: 60, h: 60 }
}

// Shape/rectangle icon SVGs for palette display
const SHAPE_SVG: Record<string, JSX.Element> = {
  rectangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="7" width="18" height="10" rx="1" />
    </svg>
  ),
  circle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

function PaletteIcon({ iconKey }: { iconKey: string }): JSX.Element {
  const path = ICON_PATHS[iconKey]
  if (!path) return <span className="w-5 h-5" />
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Custom Item Modal ────────────────────────────────────────────────────────

const EMOJI_SUGGESTIONS = [
  '🎸','🎹','🥁','🎺','🎷','🎻','🎤','🎙','🎚','🎛',
  '🔊','📻','🎵','🎶','🎼','🪗','🪘','🪈','🎧','💡',
  '🔌','🔋','📱','💻','🖥','🎬','📷','🎥','🏷','⭐'
]

interface CustomItemModalProps {
  initial?: CustomItemDef
  onSave: (data: { label: string; emoji: string; color: string | null }) => void
  onClose: () => void
}

function CustomItemModal({ initial, onSave, onClose }: CustomItemModalProps): JSX.Element {
  const { t } = useTranslation()
  const [label, setLabel] = useState(initial?.label ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '⭐')
  const [color, setColor] = useState<string | null>(initial?.color ?? null)

  function handleSave(): void {
    const trimmed = label.trim()
    if (!trimmed) return
    onSave({ label: trimmed, emoji, color })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-72 p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold">
          {initial ? t('palette.customEdit') : t('palette.customNew')}
        </h3>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">{t('palette.customName')}</label>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose() }}
            placeholder={t('palette.customNamePlaceholder')}
            className="bg-surface-2 border border-border rounded px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </div>

        {/* Emoji picker */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">{t('palette.customEmoji')}</label>
          <div className="flex flex-wrap gap-1">
            {EMOJI_SUGGESTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-8 h-8 rounded text-base flex items-center justify-center transition-colors
                  ${emoji === e ? 'bg-accent/30 ring-1 ring-accent' : 'hover:bg-surface-2'}`}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="or type any emoji…"
            className="bg-surface-2 border border-border rounded px-2 py-1 text-sm outline-none focus:border-accent mt-1"
          />
        </div>

        {/* Color */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">{t('palette.customColor')}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color ?? '#6366f1'}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border border-border"
            />
            <span className="text-xs text-muted">{color ?? t('palette.customColorNone')}</span>
            {color && (
              <button onClick={() => setColor(null)} className="text-xs text-muted hover:text-white ml-auto">
                {t('palette.customColorReset')}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-1.5 rounded text-sm border border-border hover:bg-surface-2 transition-colors"
          >
            {t('palette.customCancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="flex-1 py-1.5 rounded text-sm bg-accent text-white hover:bg-accent/90 disabled:opacity-40 transition-colors"
          >
            {t('palette.customSave')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ItemPalette(): JSX.Element {
  const { t } = useTranslation()
  const { activeProject, addItem } = useProjectStore()
  const { customItems, addCustomItem, updateCustomItem, deleteCustomItem } = usePrefsStore()
  const [search, setSearch] = useState('')
  const [modalState, setModalState] = useState<
    | { mode: 'create' }
    | { mode: 'edit'; def: CustomItemDef }
    | null
  >(null)

  const query = search.toLowerCase()
  const filtered = PALETTE_ITEMS.filter((item) => t(item.tKey).toLowerCase().includes(query))
  const filteredShapes = SHAPE_ITEMS.filter((item) => t(item.tKey).toLowerCase().includes(query))
  const filteredCables = CABLE_ITEMS.filter((item) => t(item.tKey).toLowerCase().includes(query))
  const filteredAnnotations = ANNOTATION_ITEMS.filter((item) =>
    t(item.tKey).toLowerCase().includes(query)
  )
  const filteredCustom = customItems.filter((c) => c.label.toLowerCase().includes(query))

  function handleAdd(type: StageItemType, label: string, extra?: StageItem['extra'], color?: string | null): void {
    if (!activeProject) return
    const size = DEFAULT_SIZES[type]
    const isCable =
      type === 'cable_xlr' ||
      type === 'cable_trs' ||
      type === 'cable_ts' ||
      type === 'cable_midi' ||
      type === 'cable_speakon'

    const itemExtra: StageItem['extra'] = extra !== undefined
      ? extra
      : isCable
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
      color: color !== undefined ? color : null,
      extra: itemExtra,
      sort_order: Date.now()
    })
  }

  function handleAddCustom(def: CustomItemDef): void {
    handleAdd('custom', def.label, { emoji: def.emoji, defId: def.id }, def.color)
  }

  function renderSection(entries: PaletteEntry[], sectionKey: string): JSX.Element | null {
    if (!entries.length) return null
    return (
      <>
        <SectionDivider label={t(sectionKey)} />
        {entries.map(({ type, tKey, iconKey }) => {
          const label = t(tKey)
          const shapeEl = SHAPE_SVG[type]
          return (
            <button
              key={type}
              disabled={!activeProject}
              onClick={() => handleAdd(type, label)}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-left
                         hover:bg-surface-2 active:scale-95 disabled:opacity-30
                         disabled:cursor-not-allowed transition-all"
            >
              <span className="w-5 h-5 flex items-center justify-center text-muted">
                {shapeEl ?? <PaletteIcon iconKey={iconKey} />}
              </span>
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
    filteredAnnotations.length === 0 &&
    filteredCustom.length === 0

  return (
    <>
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

          {/* Instruments */}
          {filtered.map(({ type, tKey, iconKey }) => {
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
                <span className="w-5 h-5 flex items-center justify-center text-muted">
                  <PaletteIcon iconKey={iconKey} />
                </span>
                <span className="text-[13px]">{label}</span>
              </button>
            )
          })}

          {renderSection(filteredShapes, 'palette.shapes')}
          {renderSection(filteredCables, 'palette.cables')}
          {renderSection(filteredAnnotations, 'palette.annotations')}

          {/* Custom Items */}
          {(filteredCustom.length > 0 || !search) && (
            <>
              <SectionDivider label={t('palette.custom')} />
              {filteredCustom.map((def) => (
                <div key={def.id} className="group flex items-center rounded hover:bg-surface-2">
                  <button
                    disabled={!activeProject}
                    onClick={() => handleAddCustom(def)}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm text-left
                               active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-base leading-none">
                      {def.emoji}
                    </span>
                    <span className="text-[13px] truncate">{def.label}</span>
                  </button>
                  {/* Edit / delete shown on hover */}
                  <div className="hidden group-hover:flex items-center pr-1 gap-0.5">
                    <button
                      onClick={() => setModalState({ mode: 'edit', def })}
                      className="p-1 rounded hover:bg-surface text-muted hover:text-white text-xs"
                      title={t('palette.customEditTitle')}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteCustomItem(def.id)}
                      className="p-1 rounded hover:bg-surface text-muted hover:text-red-400 text-xs"
                      title={t('palette.customDeleteTitle')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Add new custom item button */}
              <button
                onClick={() => setModalState({ mode: 'create' })}
                className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-left
                           hover:bg-surface-2 active:scale-95 transition-all text-muted hover:text-white"
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <span className="text-[13px]">{t('palette.customAdd')}</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Custom item modal — rendered outside <aside> to avoid z-index issues */}
      {modalState && (
        <CustomItemModal
          initial={modalState.mode === 'edit' ? modalState.def : undefined}
          onClose={() => setModalState(null)}
          onSave={(data) => {
            if (modalState.mode === 'create') {
              addCustomItem(data)
            } else {
              updateCustomItem(modalState.def.id, data)
            }
            setModalState(null)
          }}
        />
      )}
    </>
  )
}

function SectionDivider({ label }: { label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-2 px-1 pt-2 pb-1">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
