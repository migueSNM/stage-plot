import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import { usePrefsStore, type CustomItemDef } from '../../store/usePrefsStore'
import { ICON_BODIES } from '../../assets/icons/iconPaths'
import type { StageItem, StageItemType } from '../../../../shared/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type PaletteEntry = {
  type: StageItemType
  tKey: string
  iconKey: string
  defaultColor?: string
}

type PaletteCategory = {
  id: string
  tKey: string
  items: PaletteEntry[]
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: 'people',
    tKey: 'palette.catPeople',
    items: [
      { type: 'person', tKey: 'palette.performer', iconKey: 'person' }
    ]
  },
  {
    id: 'guitars',
    tKey: 'palette.catGuitars',
    items: [
      { type: 'guitar_acoustic',  tKey: 'palette.guitarAcoustic',  iconKey: 'guitar_acoustic' },
      { type: 'guitar_electric',  tKey: 'palette.guitarElectric',  iconKey: 'guitar_electric' },
      { type: 'guitar_classical', tKey: 'palette.guitarClassical', iconKey: 'guitar_classical' },
      { type: 'bass_electric',    tKey: 'palette.bassElectric',    iconKey: 'bass_electric' },
      { type: 'bass_upright',     tKey: 'palette.bassUpright',     iconKey: 'bass_upright' }
    ]
  },
  {
    id: 'amps',
    tKey: 'palette.catAmps',
    items: [
      { type: 'amp_combo', tKey: 'palette.ampCombo', iconKey: 'amp_combo' },
      { type: 'amp_head',  tKey: 'palette.ampHead',  iconKey: 'amp_head' },
      { type: 'amp_cab',   tKey: 'palette.ampCab',   iconKey: 'amp_cab' },
      { type: 'amp_bass',  tKey: 'palette.ampBass',  iconKey: 'amp_bass' }
    ]
  },
  {
    id: 'keys',
    tKey: 'palette.catKeys',
    items: [
      { type: 'piano_grand',      tKey: 'palette.pianoGrand',      iconKey: 'piano_grand' },
      { type: 'piano_baby_grand', tKey: 'palette.pianoBabyGrand',  iconKey: 'piano_baby_grand' },
      { type: 'piano_upright',    tKey: 'palette.pianoUpright',    iconKey: 'piano_upright' },
      { type: 'keyboard',         tKey: 'palette.keyboard',        iconKey: 'keyboard' },
      { type: 'organ',            tKey: 'palette.organ',           iconKey: 'organ' }
    ]
  },
  {
    id: 'drums',
    tKey: 'palette.catDrums',
    items: [
      { type: 'drums',            tKey: 'palette.drums',           iconKey: 'drums' },
      { type: 'drums_electronic', tKey: 'palette.drumsElectronic', iconKey: 'drums_electronic' },
      { type: 'drums_kick',       tKey: 'palette.drumsKick',       iconKey: 'drums_kick' },
      { type: 'drums_snare',      tKey: 'palette.drumsSnare',      iconKey: 'drums_snare' },
      { type: 'drums_hihat',      tKey: 'palette.drumsHihat',      iconKey: 'drums_hihat' },
      { type: 'drums_cymbal',     tKey: 'palette.drumsCymbal',     iconKey: 'drums_cymbal' },
      { type: 'cajon',            tKey: 'palette.cajon',           iconKey: 'cajon' },
      { type: 'congas',           tKey: 'palette.congas',          iconKey: 'congas' },
      { type: 'marimba',          tKey: 'palette.marimba',         iconKey: 'marimba' },
      { type: 'timpani',          tKey: 'palette.timpani',         iconKey: 'timpani' }
    ]
  },
  {
    id: 'horns',
    tKey: 'palette.catHorns',
    items: [
      { type: 'wind_trumpet',   tKey: 'palette.windTrumpet',   iconKey: 'wind_trumpet' },
      { type: 'wind_trombone',  tKey: 'palette.windTrombone',  iconKey: 'wind_trombone' },
      { type: 'wind_saxophone', tKey: 'palette.windSaxophone', iconKey: 'wind_saxophone' },
      { type: 'wind_flute',     tKey: 'palette.windFlute',     iconKey: 'wind_flute' }
    ]
  },
  {
    id: 'mics',
    tKey: 'palette.catMics',
    items: [
      { type: 'microphone',    tKey: 'palette.microphone',   iconKey: 'microphone' },
      { type: 'mic_stand',     tKey: 'palette.micStand',     iconKey: 'mic_stand' },
      { type: 'mic_overhead',  tKey: 'palette.micOverhead',  iconKey: 'mic_overhead' }
    ]
  },
  {
    id: 'pa',
    tKey: 'palette.catPa',
    items: [
      { type: 'speaker_main',     tKey: 'palette.mainSpeaker',    iconKey: 'speaker_main' },
      { type: 'subwoofer',        tKey: 'palette.subwoofer',      iconKey: 'subwoofer' },
      { type: 'monitor',          tKey: 'palette.monitor',        iconKey: 'monitor' },
      { type: 'monitor_sidefill', tKey: 'palette.monitorSidefill',iconKey: 'monitor_sidefill' },
      { type: 'di_box',           tKey: 'palette.diBox',          iconKey: 'di_box' }
    ]
  },
  {
    id: 'stage',
    tKey: 'palette.catStage',
    items: [
      { type: 'platform', tKey: 'palette.platform', iconKey: 'platform', defaultColor: '#3a3a5c' },
      { type: 'desk_foh', tKey: 'palette.deskFoh',  iconKey: 'desk_foh' }
    ]
  }
]

const CABLE_ITEMS: PaletteEntry[] = [
  { type: 'cable_xlr',    tKey: 'palette.cableXlr',    iconKey: 'cable' },
  { type: 'cable_trs',    tKey: 'palette.cableTrs',    iconKey: 'cable' },
  { type: 'cable_ts',     tKey: 'palette.cableTs',     iconKey: 'cable' },
  { type: 'cable_midi',   tKey: 'palette.cableMidi',   iconKey: 'cable' },
  { type: 'cable_speakon',tKey: 'palette.cableSpeakon',iconKey: 'cable' }
]

const ANNOTATION_ITEMS: PaletteEntry[] = [
  { type: 'text', tKey: 'palette.text', iconKey: 'text' }
]

// ─── Default sizes per type ───────────────────────────────────────────────────

const DEFAULT_SIZES: Partial<Record<StageItemType, { w: number; h: number }>> & { _default: { w: number; h: number } } = {
  _default:         { w: 60, h: 60 },
  // People
  person:           { w: 60, h: 60 },
  // Guitars & Basses
  guitar_acoustic:  { w: 50, h: 90 },
  guitar_electric:  { w: 50, h: 85 },
  guitar_classical: { w: 50, h: 90 },
  guitar:           { w: 50, h: 80 },
  bass_electric:    { w: 50, h: 90 },
  bass_upright:     { w: 50, h: 110 },
  bass:             { w: 50, h: 80 },
  // Amplifiers
  amp_combo:        { w: 80, h: 80 },
  amp_head:         { w: 100, h: 50 },
  amp_cab:          { w: 80, h: 100 },
  amp_bass:         { w: 90, h: 90 },
  amp:              { w: 70, h: 70 },
  // Keyboards & Piano
  piano_grand:      { w: 160, h: 100 },
  piano_baby_grand: { w: 130, h: 85 },
  piano_upright:    { w: 130, h: 60 },
  keyboard:         { w: 120, h: 40 },
  organ:            { w: 110, h: 65 },
  // Drums & Percussion
  drums:            { w: 110, h: 110 },
  drums_electronic: { w: 110, h: 70 },
  drums_kick:       { w: 70, h: 55 },
  drums_snare:      { w: 50, h: 40 },
  drums_hihat:      { w: 40, h: 60 },
  drums_cymbal:     { w: 55, h: 55 },
  cajon:            { w: 45, h: 70 },
  congas:           { w: 65, h: 80 },
  marimba:          { w: 140, h: 55 },
  timpani:          { w: 80, h: 65 },
  percussion:       { w: 80, h: 80 },
  // Horns & Winds
  wind_trumpet:     { w: 65, h: 50 },
  wind_trombone:    { w: 80, h: 50 },
  wind_saxophone:   { w: 50, h: 70 },
  wind_flute:       { w: 40, h: 70 },
  // Microphones
  microphone:       { w: 40, h: 55 },
  mic_stand:        { w: 40, h: 70 },
  mic_overhead:     { w: 55, h: 55 },
  // PA & Monitors
  speaker_main:     { w: 60, h: 80 },
  subwoofer:        { w: 80, h: 80 },
  monitor:          { w: 80, h: 55 },
  monitor_sidefill: { w: 90, h: 60 },
  di_box:           { w: 50, h: 50 },
  // Stage
  platform:         { w: 200, h: 120 },
  desk_foh:         { w: 100, h: 65 },
  // Cables (stored as width=distance, height=0)
  cable_xlr:        { w: 100, h: 0 },
  cable_trs:        { w: 100, h: 0 },
  cable_ts:         { w: 100, h: 0 },
  cable_midi:       { w: 100, h: 0 },
  cable_speakon:    { w: 100, h: 0 },
  // Misc
  text:             { w: 120, h: 30 },
  custom:           { w: 60, h: 60 },
  generic:          { w: 60, h: 60 }
}

function getSize(type: StageItemType): { w: number; h: number } {
  return (DEFAULT_SIZES as Record<string, { w: number; h: number }>)[type] ?? DEFAULT_SIZES._default
}

// ─── Icon component ───────────────────────────────────────────────────────────

function PaletteIcon({ iconKey }: { iconKey: string }): JSX.Element {
  const icon = ICON_BODIES[iconKey]
  if (!icon) return <span className="w-5 h-5" />
  return (
    <svg
      width="18"
      height="18"
      viewBox={`0 0 ${icon.size} ${icon.size}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={icon.d} fillRule="evenodd" />
    </svg>
  )
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Custom Item Modal ─────────────────────────────────────────────────────────

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

// ─── Category Section ─────────────────────────────────────────────────────────

interface CategorySectionProps {
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CategorySection({ label, isOpen, onToggle, children }: CategorySectionProps): JSX.Element {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1.5 px-2 py-1 mt-1 text-left rounded hover:bg-surface-2 transition-colors"
      >
        <span className="text-muted"><Chevron open={isOpen} /></span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex-1">{label}</span>
      </button>
      {isOpen && <div className="flex flex-col gap-0.5 pb-1">{children}</div>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

/** Tracks the last-placed item so rapid clicks stack items below each other instead of overlapping. */
const lastPlacedRef = { x: 120, y: 120, h: 60, time: 0 }
const STACK_TIMEOUT_MS = 10_000
const STACK_GAP = 12
const STACK_DEFAULT_X = 120
const STACK_DEFAULT_Y = 120

export function ItemPalette(): JSX.Element {
  const { t } = useTranslation()
  const { activeProject, addItem } = useProjectStore()
  const { customItems, addCustomItem, updateCustomItem, deleteCustomItem } = usePrefsStore()

  const [search, setSearch] = useState('')
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())
  const [modalState, setModalState] = useState<
    | { mode: 'create' }
    | { mode: 'edit'; def: CustomItemDef }
    | null
  >(null)

  const query = search.toLowerCase().trim()
  const isSearching = query.length > 0

  function toggleCat(id: string): void {
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function isCatOpen(id: string): boolean {
    if (isSearching) return true // always open when searching
    return !collapsedCats.has(id)
  }

  function handleAdd(
    type: StageItemType,
    label: string,
    extra?: StageItem['extra'],
    color?: string | null
  ): void {
    if (!activeProject) return
    const size = getSize(type)
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

    // If placed within STACK_TIMEOUT_MS of the previous item, stack below it; otherwise reset
    const now = Date.now()
    let px: number, py: number
    if (now - lastPlacedRef.time < STACK_TIMEOUT_MS) {
      px = lastPlacedRef.x
      py = lastPlacedRef.y + lastPlacedRef.h + STACK_GAP
    } else {
      px = STACK_DEFAULT_X
      py = STACK_DEFAULT_Y
    }
    lastPlacedRef.x = px
    lastPlacedRef.y = py
    lastPlacedRef.h = size.h > 0 ? size.h : 4  // cables have h=0; give them a small slot
    lastPlacedRef.time = now

    addItem({
      id: generateId(),
      project_id: activeProject.id,
      type,
      label,
      x: px,
      y: py,
      rotation: 0,
      width: size.w,
      height: size.h,
      color: color !== undefined ? color : null,
      extra: isCable
        ? { fromId: null, toId: null, x2: px + size.w, y2: py }
        : itemExtra,
      sort_order: Date.now()
    })
  }

  function handleAddCustom(def: CustomItemDef): void {
    handleAdd('custom', def.label, { emoji: def.emoji, defId: def.id }, def.color)
  }

  function renderEntry({ type, tKey, iconKey, defaultColor }: PaletteEntry): JSX.Element {
    const label = t(tKey)
    return (
      <button
        key={type}
        disabled={!activeProject}
        onClick={() => handleAdd(type, label, undefined, defaultColor ?? null)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded text-sm text-left
                   hover:bg-surface-2 active:scale-95 disabled:opacity-30
                   disabled:cursor-not-allowed transition-all"
      >
        <span className="w-[18px] h-[18px] flex items-center justify-center text-muted flex-shrink-0">
          <PaletteIcon iconKey={iconKey} />
        </span>
        <span className="text-[12px] leading-tight">{label}</span>
      </button>
    )
  }

  // Filter entries for search
  function filterEntries(entries: PaletteEntry[]): PaletteEntry[] {
    if (!isSearching) return entries
    return entries.filter((e) => t(e.tKey).toLowerCase().includes(query))
  }

  const filteredCables = filterEntries(CABLE_ITEMS)
  const filteredAnnotations = filterEntries(ANNOTATION_ITEMS)
  const filteredCustom = customItems.filter((c) => !isSearching || c.label.toLowerCase().includes(query))

  const filteredCategories = PALETTE_CATEGORIES.map((cat) => ({
    ...cat,
    items: filterEntries(cat.items)
  })).filter((cat) => !isSearching || cat.items.length > 0)

  const hasNoResults =
    filteredCategories.length === 0 &&
    filteredCables.length === 0 &&
    filteredAnnotations.length === 0 &&
    filteredCustom.length === 0

  return (
    <>
      <aside className="w-52 flex-shrink-0 bg-surface border-r border-border flex flex-col">
        {/* Header + search */}
        <div className="px-3 pt-3 pb-2 border-b border-border flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted px-1">
            {t('palette.title')}
          </h2>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
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

        {/* Scrollable item list */}
        <div className="flex-1 overflow-y-auto p-1.5 flex flex-col">
          {hasNoResults && (
            <p className="text-muted text-xs text-center py-6">{t('palette.noMatch')}</p>
          )}

          {/* Instrument categories */}
          {filteredCategories.map((cat) => (
            <CategorySection
              key={cat.id}
              label={t(cat.tKey)}
              isOpen={isCatOpen(cat.id)}
              onToggle={() => toggleCat(cat.id)}
            >
              {cat.items.map(renderEntry)}
            </CategorySection>
          ))}

          {/* Cables */}
          {filteredCables.length > 0 && (
            <CategorySection
              label={t('palette.catCables')}
              isOpen={isCatOpen('cables')}
              onToggle={() => toggleCat('cables')}
            >
              {filteredCables.map(renderEntry)}
            </CategorySection>
          )}
          {!isSearching && filteredCables.length === 0 && (
            <CategorySection
              label={t('palette.catCables')}
              isOpen={isCatOpen('cables')}
              onToggle={() => toggleCat('cables')}
            >
              {CABLE_ITEMS.map(renderEntry)}
            </CategorySection>
          )}

          {/* Annotations */}
          {(!isSearching || filteredAnnotations.length > 0) && (
            <CategorySection
              label={t('palette.catAnnotations')}
              isOpen={isCatOpen('annotations')}
              onToggle={() => toggleCat('annotations')}
            >
              {(isSearching ? filteredAnnotations : ANNOTATION_ITEMS).map(renderEntry)}
            </CategorySection>
          )}

          {/* Custom items */}
          {(!isSearching || filteredCustom.length > 0) && (
            <CategorySection
              label={t('palette.catCustom')}
              isOpen={isCatOpen('custom')}
              onToggle={() => toggleCat('custom')}
            >
              {filteredCustom.map((def) => (
                <div key={def.id} className="group flex items-center rounded hover:bg-surface-2">
                  <button
                    disabled={!activeProject}
                    onClick={() => handleAddCustom(def)}
                    className="flex-1 flex items-center gap-2.5 px-3 py-1.5 text-sm text-left
                               active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="w-[18px] h-[18px] flex items-center justify-center text-base leading-none flex-shrink-0">
                      {def.emoji}
                    </span>
                    <span className="text-[12px] truncate">{def.label}</span>
                  </button>
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
              <button
                onClick={() => setModalState({ mode: 'create' })}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded text-sm text-left
                           hover:bg-surface-2 active:scale-95 transition-all text-muted hover:text-white"
              >
                <span className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <span className="text-[12px]">{t('palette.customAdd')}</span>
              </button>
            </CategorySection>
          )}
        </div>
      </aside>

      {/* Custom item modal */}
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
