import { useRef, useCallback, useEffect, useState } from 'react'
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva'
import type Konva from 'konva'
import { jsPDF } from 'jspdf'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import { usePrefsStore } from '../../store/usePrefsStore'
import { StageItemNode } from './StageItemNode'
import type { StageItem } from '../../../../shared/types'

const GRID_SIZE = 40

const CANVAS_COLORS = {
  dark: {
    bg: '#0d0d1a',
    grid: '#1a1a30',
    stageBorder: '#222248',
    stageText: '#2e2e5a',
    label: '#b0b0c8',
    labelSelected: '#ffffff'
  },
  light: {
    bg: '#edf0fa',
    grid: '#d4d8ee',
    stageBorder: '#9090bb',
    stageText: '#a0a0cc',
    label: '#4a4a72',
    labelSelected: '#1a1a2e'
  }
}

interface ContextMenu {
  x: number
  y: number
  itemId: string
}

interface StageCanvasProps {
  width: number
  height: number
}

export function StageCanvas({ width, height }: StageCanvasProps): JSX.Element {
  const { t } = useTranslation()
  const theme = usePrefsStore((s) => s.theme)
  const colors = CANVAS_COLORS[theme]

  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const nodeRefs = useRef(new Map<string, Konva.Group>())

  const { items, activeProject, updateItemPosition, updateItem, nudgeItem, deleteItem, registerExport } =
    useProjectStore()

  // Tracks whether an arrow key is currently held so we only push one undo entry
  const arrowHeldRef = useRef(false)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedItem = items.find((i) => i.id === selectedId) ?? null
  const isSelectedShape = selectedItem?.type === 'rectangle' || selectedItem?.type === 'circle'
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // ── Attach Transformer to selected node ───────────────────────────────────

  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    if (selectedId) {
      const node = nodeRefs.current.get(selectedId)
      tr.nodes(node ? [node] : [])
    } else {
      tr.nodes([])
    }
    tr.getLayer()?.batchDraw()
  }, [selectedId, items])

  // ── Export ────────────────────────────────────────────────────────────────

  const exportPng = useCallback(() => {
    if (!stageRef.current || !activeProject) return
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `${activeProject.name}.png`
    link.href = dataUrl
    link.click()
  }, [activeProject])

  const exportPdf = useCallback(() => {
    if (!stageRef.current || !activeProject) return
    const w = stageRef.current.width()
    const h = stageRef.current.height()
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
    const pdf = new jsPDF({
      orientation: w > h ? 'landscape' : 'portrait',
      unit: 'px',
      format: [w, h],
      hotfixes: ['px_scaling']
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, w, h)
    pdf.save(`${activeProject.name}.pdf`)
  }, [activeProject])

  useEffect(() => {
    registerExport({ png: exportPng, pdf: exportPdf })
  }, [exportPng, exportPdf, registerExport])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

    function onKeyDown(e: KeyboardEvent): void {
      if (editingId) return

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteItem(selectedId)
        setSelectedId(null)
        return
      }

      if (e.key === 'Escape') {
        setSelectedId(null)
        setContextMenu(null)
        return
      }

      // [ / ] → rotate CCW / CW; +Shift for 45° steps, default 15°
      if ((e.key === '[' || e.key === ']') && selectedId) {
        e.preventDefault()
        const item = useProjectStore.getState().items.find((i) => i.id === selectedId)
        if (!item) return
        const step = e.shiftKey ? 45 : 15
        const dir = e.key === '[' ? -1 : 1
        updateItem({ ...item, rotation: ((item.rotation ?? 0) + dir * step + 360) % 360 })
        return
      }

      // Arrow keys → nudge selected item; Shift = 10px, default 1px
      if (ARROW_KEYS.includes(e.key) && selectedId) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx =
          e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy =
          e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0

        // Push history only on the first press; held repeats skip it
        if (!arrowHeldRef.current) {
          useProjectStore.getState().pushHistory()
          arrowHeldRef.current = true
        }
        nudgeItem(selectedId, dx, dy)
      }
    }

    function onKeyUp(e: KeyboardEvent): void {
      if (ARROW_KEYS.includes(e.key)) arrowHeldRef.current = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [selectedId, editingId, deleteItem, updateItem, nudgeItem])

  // ── Dismiss context menu on outside click ────────────────────────────────

  useEffect(() => {
    if (!contextMenu) return
    function dismiss(): void {
      setContextMenu(null)
    }
    window.addEventListener('pointerdown', dismiss)
    return () => window.removeEventListener('pointerdown', dismiss)
  }, [contextMenu])

  // ── Focus rename input when it appears ───────────────────────────────────

  useEffect(() => {
    if (editingId) setTimeout(() => editInputRef.current?.focus(), 0)
  }, [editingId])

  // ── Helpers ───────────────────────────────────────────────────────────────

  function startEditing(item: StageItem): void {
    setEditingId(item.id)
    setEditText(item.label)
    setContextMenu(null)
  }

  function commitEdit(): void {
    if (!editingId) return
    const item = items.find((i) => i.id === editingId)
    if (item && editText.trim()) {
      updateItem({ ...item, label: editText.trim() })
    }
    setEditingId(null)
  }

  function handleDragEnd(item: StageItem, e: Konva.KonvaEventObject<DragEvent>): void {
    updateItemPosition(item.id, e.target.x(), e.target.y())
  }

  // Read latest values from store to avoid stale closures
  function handleTransformEnd(): void {
    const { items: latest, updateItem: doUpdate } = useProjectStore.getState()
    if (!selectedId) return
    const node = nodeRefs.current.get(selectedId)
    if (!node) return
    const item = latest.find((i) => i.id === selectedId)
    if (!item) return

    const isShape = item.type === 'rectangle' || item.type === 'circle'
    if (isShape) {
      // Transformer applies scale to the Group — convert back to actual width/height
      const newWidth = Math.max(20, item.width * node.scaleX())
      const newHeight = Math.max(20, item.height * node.scaleY())
      node.scaleX(1)
      node.scaleY(1)
      doUpdate({ ...item, x: node.x(), y: node.y(), rotation: node.rotation(), width: newWidth, height: newHeight })
    } else {
      doUpdate({ ...item, x: node.x(), y: node.y(), rotation: node.rotation() })
    }
  }

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>): void {
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
      setContextMenu(null)
    }
  }

  function rotateSelected(deg: number): void {
    const item = items.find((i) => i.id === contextMenu?.itemId)
    if (!item) return
    updateItem({ ...item, rotation: ((item.rotation ?? 0) + deg + 360) % 360 })
    setContextMenu(null)
  }

  function getEditStyle(item: StageItem): React.CSSProperties {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return {}
    return {
      position: 'fixed',
      left: rect.left + item.x - 12,
      top: rect.top + item.y + item.height + 4,
      width: item.width + 24,
      zIndex: 100
    }
  }

  // ── Grid ──────────────────────────────────────────────────────────────────

  const gridLines = useCallback(() => {
    const lines: JSX.Element[] = []
    for (let i = 0; i <= Math.ceil(width / GRID_SIZE); i++) {
      lines.push(
        <Rect
          key={`v${i}`}
          x={i * GRID_SIZE}
          y={0}
          width={1}
          height={height}
          fill={colors.grid}
        />
      )
    }
    for (let i = 0; i <= Math.ceil(height / GRID_SIZE); i++) {
      lines.push(
        <Rect
          key={`h${i}`}
          x={0}
          y={i * GRID_SIZE}
          width={width}
          height={1}
          fill={colors.grid}
        />
      )
    }
    return lines
  }, [width, height, colors.grid])

  const editingItem = editingId ? items.find((i) => i.id === editingId) : null

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={{ background: colors.bg }}
        onClick={handleStageClick}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        {/* Grid + boundary */}
        <Layer listening={false}>
          <Rect x={0} y={0} width={width} height={height} fill={colors.bg} />
          {gridLines()}
          <Rect
            x={GRID_SIZE}
            y={GRID_SIZE}
            width={width - GRID_SIZE * 2}
            height={height - GRID_SIZE * 2}
            stroke={colors.stageBorder}
            strokeWidth={1.5}
            dash={[8, 6]}
            fill="transparent"
          />
          <Text
            x={width / 2 - 70}
            y={GRID_SIZE / 2 - 7}
            text={t('canvas.frontOfStage')}
            fontSize={11}
            fill={colors.stageText}
            fontStyle="bold"
            letterSpacing={2}
          />
        </Layer>

        {/* Items + Transformer */}
        <Layer>
          {items.map((item) => (
            <StageItemNode
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              labelColor={colors.label}
              selectedLabelColor={colors.labelSelected}
              nodeRef={(node) => {
                if (node) nodeRefs.current.set(item.id, node)
                else nodeRefs.current.delete(item.id)
              }}
              onSelect={() => setSelectedId(item.id)}
              onDragEnd={(e) => handleDragEnd(item, e)}
              onContextMenu={(x, y) => {
                setSelectedId(item.id)
                setContextMenu({ x, y, itemId: item.id })
              }}
              onDblClick={() => startEditing(item)}
            />
          ))}
          <Transformer
            ref={trRef}
            resizeEnabled={isSelectedShape}
            keepRatio={selectedItem?.type === 'circle'}
            rotateEnabled={true}
            rotationSnaps={[0, 90, 180, 270]}
            rotationSnapTolerance={10}
            borderStroke={theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)'}
            borderStrokeWidth={1}
            borderDash={[4, 4]}
            anchorStroke={theme === 'dark' ? '#ffffff' : '#333333'}
            anchorFill={theme === 'dark' ? '#1a1a2e' : '#ffffff'}
            anchorSize={10}
            rotateAnchorOffset={28}
            onTransformEnd={handleTransformEnd}
          />
        </Layer>
      </Stage>

      {/* Inline rename input */}
      {editingItem && (
        <input
          ref={editInputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') setEditingId(null)
          }}
          style={getEditStyle(editingItem)}
          className="bg-surface-2 border border-accent text-sm text-center
                     rounded px-1 py-0.5 outline-none shadow-lg"
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-surface border border-border rounded-lg shadow-2xl py-1 min-w-44 overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => {
              const item = items.find((i) => i.id === contextMenu.itemId)
              if (item) startEditing(item)
            }}
          >
            ✏️ {t('contextMenu.rename')}
          </button>
          <div className="h-px bg-border mx-2 my-1" />
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => rotateSelected(90)}
          >
            🔃 {t('contextMenu.rotateCW')}
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => rotateSelected(-90)}
          >
            🔄 {t('contextMenu.rotateCCW')}
          </button>
          <div className="h-px bg-border mx-2 my-1" />
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => {
              deleteItem(contextMenu.itemId)
              setSelectedId(null)
              setContextMenu(null)
            }}
          >
            🗑 {t('contextMenu.delete')}
          </button>
        </div>
      )}

      {/* Hint bar */}
      {selectedId && !editingId && !contextMenu && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted bg-surface/80 px-3 py-1.5 rounded-full pointer-events-none select-none whitespace-nowrap">
          {t('canvas.hint')}
        </div>
      )}
    </div>
  )
}
