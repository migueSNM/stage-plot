import { useProjectStore } from '../../store/useProjectStore'
import type { StageItemType } from '../../../../shared/types'

const PALETTE_ITEMS: { type: StageItemType; label: string; icon: string }[] = [
  { type: 'person', label: 'Performer', icon: '🎤' },
  { type: 'microphone', label: 'Microphone', icon: '🎙' },
  { type: 'monitor', label: 'Monitor', icon: '📢' },
  { type: 'amp', label: 'Amp', icon: '🔊' },
  { type: 'keyboard', label: 'Keyboard', icon: '🎹' },
  { type: 'drums', label: 'Drums', icon: '🥁' },
  { type: 'di_box', label: 'DI Box', icon: '📦' },
  { type: 'speaker_main', label: 'Main Speaker', icon: '📯' },
  { type: 'generic', label: 'Generic', icon: '⬜' }
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
  generic: { w: 60, h: 60 }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ItemPalette(): JSX.Element {
  const { activeProject, addItem } = useProjectStore()

  function handleAdd(type: StageItemType, label: string): void {
    if (!activeProject) return
    const size = DEFAULT_SIZES[type]
    addItem({
      id: generateId(),
      project_id: activeProject.id,
      type,
      label,
      x: 100,
      y: 100,
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
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Items</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {PALETTE_ITEMS.map(({ type, label, icon }) => (
          <button
            key={type}
            disabled={!activeProject}
            onClick={() => handleAdd(type, label)}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm text-left
                       hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
          >
            <span className="text-lg leading-none">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
