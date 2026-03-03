import { useEffect } from 'react'
import type { StageItem } from '../../../../shared/types'

const PRESETS = [
  '#e94560',
  '#f5a623',
  '#f1c40f',
  '#7ed321',
  '#1abc9c',
  '#4a90e2',
  '#9b59b6',
  '#e67e22',
  '#c0392b',
  '#2ecc71',
  '#3498db',
  '#95a5a6'
]

interface ColorPickerPopoverProps {
  item: StageItem
  canvasPos: { x: number; y: number }
  canvasScale: number
  containerRect: DOMRect
  onSelect: (color: string | null) => void
  onDismiss: () => void
}

export function ColorPickerPopover({
  item,
  canvasPos,
  canvasScale,
  containerRect,
  onSelect,
  onDismiss
}: ColorPickerPopoverProps): JSX.Element {
  const left = containerRect.left + item.x * canvasScale + canvasPos.x
  const top = containerRect.top + (item.y + item.height + 10) * canvasScale + canvasPos.y

  useEffect(() => {
    function dismiss(): void {
      onDismiss()
    }
    // Defer so this click doesn't immediately dismiss
    const timer = setTimeout(() => window.addEventListener('pointerdown', dismiss), 0)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', dismiss)
    }
  }, [onDismiss])

  return (
    <div
      className="fixed z-50 bg-surface border border-border rounded-lg shadow-2xl p-2"
      style={{ left, top }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-4 gap-1 mb-2">
        {PRESETS.map((c) => (
          <button
            key={c}
            className="w-7 h-7 rounded border-2 border-transparent hover:border-white transition-colors"
            style={{ background: c }}
            onClick={() => {
              onSelect(c)
              onDismiss()
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          defaultValue={item.color ?? '#ffffff'}
          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          onChange={(e) => onSelect(e.target.value)}
        />
        <button
          className="text-xs text-muted hover:text-white transition-colors"
          onClick={() => {
            onSelect(null)
            onDismiss()
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
