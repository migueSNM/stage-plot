import { useRef, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Stage, Layer, Rect, Text, Transformer, Circle, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import { jsPDF } from 'jspdf'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import { usePrefsStore } from '../../store/usePrefsStore'
import { StageItemNode } from './StageItemNode'
import { CableNode } from './CableNode'
import type { PortSide } from './CableNode'
import { TextNode } from './TextNode'
import { ColorPickerPopover } from './ColorPickerPopover'
import type { StageItem } from '../../../../shared/types'

const GRID_SIZE = 40

const CABLE_TYPES = new Set([
  'cable_xlr',
  'cable_trs',
  'cable_ts',
  'cable_midi',
  'cable_speakon'
])

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

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

interface ContextMenu {
  x: number
  y: number
  itemId: string
}

interface MarqueeRect {
  x: number
  y: number
  width: number
  height: number
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

  const {
    items,
    activeProject,
    updateItemPosition,
    updateItem,
    nudgeItem,
    nudgeItems,
    deleteItems,
    bringToFront,
    sendToBack,
    toggleLayerLock,
    registerExport,
    canvasScale,
    canvasPos,
    setCanvasScale,
    setCanvasPos,
    backgroundImage,
    backgroundLocked,
    backgroundX,
    backgroundY,
    backgroundWidth,
    backgroundHeight
  } = useProjectStore()

  // Items sorted by sort_order so higher values render on top in Konva
  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order)

  // Background image as HTMLImageElement for Konva
  const [bgHtmlImg, setBgHtmlImg] = useState<HTMLImageElement | null>(null)
  const [backgroundSelected, setBackgroundSelected] = useState(false)
  const backgroundSelectedRef = useRef(false)
  const bgImageRef = useRef<Konva.Image | null>(null)
  // Flag: set in handleTransformEnd so useLayoutEffect can call forceUpdate after commit
  const pendingTransformerUpdateRef = useRef(false)

  // Keep backgroundSelectedRef in sync
  backgroundSelectedRef.current = backgroundSelected

  useEffect(() => {
    if (!backgroundImage) {
      setBgHtmlImg(null)
      return
    }
    const img = new window.Image()
    img.onload = () => {
      setBgHtmlImg(img)
      const { backgroundX } = useProjectStore.getState()
      if (backgroundX === null) {
        const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight)
        const bgW = img.naturalWidth * scale
        const bgH = img.naturalHeight * scale
        useProjectStore.getState().setBackgroundTransform(
          (width - bgW) / 2,
          (height - bgH) / 2,
          bgW,
          bgH
        )
      }
    }
    img.src = backgroundImage
  }, [backgroundImage, width, height])

  // Tracks whether an arrow key is currently held so we only push one undo entry
  const arrowHeldRef = useRef(false)
  const marqueeWasDraggedRef = useRef(false)

  // Pan state
  const spaceDownRef = useRef(false)
  const isPanningRef = useRef(false)
  const panStartRef = useRef<{
    pointerX: number
    pointerY: number
    canvasX: number
    canvasY: number
  } | null>(null)

  // Refs for keyboard handler (avoids stale closures)
  const selectedIdsRef = useRef<string[]>([])
  const editingIdRef = useRef<string | null>(null)
  const snapTargetRef = useRef<{ id: string; side: PortSide } | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null)
  const [marqueeRect, setMarqueeRect] = useState<MarqueeRect | null>(null)
  const [snapTarget, setSnapTarget] = useState<{ id: string; side: PortSide } | null>(null)
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null)
  const [panCursor, setPanCursor] = useState<'none' | 'grab' | 'grabbing'>('none')

  // Keep refs in sync
  selectedIdsRef.current = selectedIds
  editingIdRef.current = editingId
  snapTargetRef.current = snapTarget

  // Derived values
  const singleSelected =
    selectedIds.length === 1 ? (items.find((i) => i.id === selectedIds[0]) ?? null) : null
  const isSelectedShape =
    singleSelected?.type === 'rectangle' ||
    singleSelected?.type === 'circle' ||
    singleSelected?.type === 'text' ||
    singleSelected?.type === 'platform'

  // ── Attach Transformer to selected nodes ──────────────────────────────────

  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    if (backgroundSelected && bgImageRef.current && !backgroundLocked) {
      tr.nodes([bgImageRef.current])
      tr.getLayer()?.batchDraw()
      return
    }
    const nodes = selectedIds
      .filter((id) => {
        const item = items.find((i) => i.id === id)
        return item && !CABLE_TYPES.has(item.type)
      })
      .map((id) => nodeRefs.current.get(id))
      .filter((n): n is Konva.Group => !!n)
    tr.nodes(nodes)
    tr.getLayer()?.batchDraw()
  }, [selectedIds, items, backgroundSelected, backgroundLocked])

  // ── Force Transformer refresh after dimensions change (post-commit) ────────
  // useLayoutEffect with no deps runs synchronously after every commit.
  // handleTransformEnd sets pendingTransformerUpdateRef before updating state,
  // so by the time this runs, Konva nodes already have the new dimensions.
  useLayoutEffect(() => {
    if (pendingTransformerUpdateRef.current) {
      pendingTransformerUpdateRef.current = false
      trRef.current?.forceUpdate()
      trRef.current?.getLayer()?.batchDraw()
    }
  })

  // ── Export ────────────────────────────────────────────────────────────────

  const exportPng = useCallback(() => {
    if (!stageRef.current || !activeProject) return
    const stage = stageRef.current
    // Temporarily reset zoom so export captures full canvas at 1:1
    const savedScaleX = stage.scaleX()
    const savedScaleY = stage.scaleY()
    const savedX = stage.x()
    const savedY = stage.y()
    stage.scaleX(1)
    stage.scaleY(1)
    stage.x(0)
    stage.y(0)
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    stage.scaleX(savedScaleX)
    stage.scaleY(savedScaleY)
    stage.x(savedX)
    stage.y(savedY)
    const link = document.createElement('a')
    link.download = `${activeProject.name}.png`
    link.href = dataUrl
    link.click()
  }, [activeProject])

  const exportPdf = useCallback(() => {
    if (!stageRef.current || !activeProject) return
    const stage = stageRef.current
    const savedScaleX = stage.scaleX()
    const savedScaleY = stage.scaleY()
    const savedX = stage.x()
    const savedY = stage.y()
    stage.scaleX(1)
    stage.scaleY(1)
    stage.x(0)
    stage.y(0)
    const w = stage.width()
    const h = stage.height()
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    stage.scaleX(savedScaleX)
    stage.scaleY(savedScaleY)
    stage.x(savedX)
    stage.y(savedY)
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
      // Space — enter pan/grab mode (skip when typing in rename input)
      if (e.key === ' ' && !e.repeat && !editingIdRef.current) {
        e.preventDefault()
        spaceDownRef.current = true
        setPanCursor('grab')
        return
      }

      if (editingIdRef.current) return
      const ids = selectedIdsRef.current
      const mod = e.metaKey || e.ctrlKey

      // Zoom shortcuts
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        const s = useProjectStore.getState().canvasScale
        useProjectStore.getState().setCanvasScale(clamp(s * 1.15, 0.2, 4))
        return
      }
      if (mod && e.key === '-') {
        e.preventDefault()
        const s = useProjectStore.getState().canvasScale
        useProjectStore.getState().setCanvasScale(clamp(s / 1.15, 0.2, 4))
        return
      }
      if (mod && e.key === '0') {
        e.preventDefault()
        useProjectStore.getState().setCanvasScale(1)
        useProjectStore.getState().setCanvasPos({ x: 0, y: 0 })
        return
      }

      // Copy / paste
      if (mod && e.key === 'c' && ids.length > 0) {
        e.preventDefault()
        useProjectStore.getState().copySelected(ids)
        return
      }
      if (mod && e.key === 'v') {
        e.preventDefault()
        useProjectStore.getState().pasteClipboard().then((newIds) => {
          if (newIds.length) setSelectedIds(newIds)
        })
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && ids.length > 0) {
        e.preventDefault()
        deleteItems(ids)
        setSelectedIds([])
        return
      }

      if (e.key === 'Escape') {
        setSelectedIds([])
        setBackgroundSelected(false)
        setContextMenu(null)
        setColorPickerFor(null)
        return
      }

      // [ / ] → rotate CCW / CW; only for single selection
      if ((e.key === '[' || e.key === ']') && ids.length === 1) {
        e.preventDefault()
        const item = useProjectStore.getState().items.find((i) => i.id === ids[0])
        if (!item) return
        const step = e.shiftKey ? 45 : 15
        const dir = e.key === '[' ? -1 : 1
        updateItem({ ...item, rotation: ((item.rotation ?? 0) + dir * step + 360) % 360 })
        return
      }

      // Arrow keys → nudge selected items; Shift = 10px, default 1px
      if (ARROW_KEYS.includes(e.key) && ids.length > 0) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0

        // Push history only on the first press; held repeats skip it
        if (!arrowHeldRef.current) {
          useProjectStore.getState().pushHistory()
          arrowHeldRef.current = true
        }
        if (ids.length === 1) {
          nudgeItem(ids[0], dx, dy)
        } else {
          nudgeItems(ids, dx, dy)
        }
      }
    }

    function onKeyUp(e: KeyboardEvent): void {
      if (e.key === ' ') {
        spaceDownRef.current = false
        if (!isPanningRef.current) setPanCursor('none')
        return
      }
      if (ARROW_KEYS.includes(e.key)) arrowHeldRef.current = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [deleteItems, updateItem, nudgeItem, nudgeItems, setPanCursor])

  // ── Global mouseup: stop panning when button released outside stage ──────

  useEffect(() => {
    function onGlobalMouseUp(): void {
      if (!isPanningRef.current) return
      isPanningRef.current = false
      panStartRef.current = null
      setPanCursor(spaceDownRef.current ? 'grab' : 'none')
    }
    window.addEventListener('mouseup', onGlobalMouseUp)
    return () => window.removeEventListener('mouseup', onGlobalMouseUp)
  }, [setPanCursor])

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

  // Bring a non-locked item to the top of the z-stack on single select
  function selectItem(id: string, shiftKey: boolean): void {
    if (shiftKey) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )
    } else {
      setSelectedIds([id])
      const item = useProjectStore.getState().items.find((i) => i.id === id)
      if (item && !(item.extra as Record<string, unknown> | null)?.layerLocked) {
        void bringToFront(id)
      }
    }
  }

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

  // ── Drag handling (supports multi-select) ─────────────────────────────────

  function handleDragMove(item: StageItem, e: Konva.KonvaEventObject<DragEvent>): void {
    const ids = selectedIdsRef.current
    if (ids.length <= 1 || !ids.includes(item.id)) return
    const dx = e.target.x() - item.x
    const dy = e.target.y() - item.y
    for (const id of ids) {
      if (id === item.id) continue
      const node = nodeRefs.current.get(id)
      const it = useProjectStore.getState().items.find((i) => i.id === id)
      if (node && it) {
        node.x(it.x + dx)
        node.y(it.y + dy)
      }
    }
  }

  function handleDragEnd(item: StageItem, e: Konva.KonvaEventObject<DragEvent>): void {
    const ids = selectedIdsRef.current
    const newX = e.target.x()
    const newY = e.target.y()

    if (ids.length > 1 && ids.includes(item.id)) {
      const dx = newX - item.x
      const dy = newY - item.y
      const latest = useProjectStore.getState().items
      const allUpdated = ids
        .map((id) => {
          const it = latest.find((i) => i.id === id)
          if (!it) return null
          const base = { ...it, x: it.x + dx, y: it.y + dy }
          if (CABLE_TYPES.has(it.type) && it.extra) {
            const ex = it.extra as {
              fromId: string | null
              toId: string | null
              fromSide: PortSide | null
              toSide: PortSide | null
              x2: number
              y2: number
            }
            return {
              ...base,
              extra: {
                ...ex,
                x2: ex.x2 + dx,
                y2: ex.y2 + dy,
                fromId: null,
                toId: null,
                fromSide: null,
                toSide: null
              }
            }
          }
          return base
        })
        .filter((it): it is StageItem => it !== null)

      useProjectStore.getState().pushHistory()
      window.api.items.saveMany(allUpdated)
      useProjectStore.setState((s) => ({
        items: s.items.map((i) => allUpdated.find((u) => u.id === i.id) ?? i)
      }))
      // Snap other nodes to their correct positions
      for (const it of allUpdated) {
        if (it.id === item.id) continue
        const node = nodeRefs.current.get(it.id)
        if (node) {
          node.x(it.x)
          node.y(it.y)
        }
      }
    } else {
      updateItemPosition(item.id, newX, newY)
    }
  }

  // Read latest values from store to avoid stale closures
  function handleTransformEnd(): void {
    if (backgroundSelectedRef.current && bgImageRef.current) {
      const node = bgImageRef.current
      const newW = Math.max(20, node.width() * node.scaleX())
      const newH = Math.max(20, node.height() * node.scaleY())
      // Reset scale and bake into dimensions imperatively so forceUpdate sees correct size
      node.scaleX(1)
      node.scaleY(1)
      node.width(newW)
      node.height(newH)
      // Synchronous forceUpdate: node dims are already correct at this point
      trRef.current?.forceUpdate()
      trRef.current?.getLayer()?.batchDraw()
      // Persist to store (synchronous state update + fire-and-forget DB)
      useProjectStore.getState().setBackgroundTransform(node.x(), node.y(), newW, newH)
      return
    }

    const { items: latest } = useProjectStore.getState()
    const ids = selectedIdsRef.current
    const updatedItems: StageItem[] = []

    for (const id of ids) {
      const node = nodeRefs.current.get(id)
      if (!node) continue
      const item = latest.find((i) => i.id === id)
      if (!item) continue

      const isShape =
        item.type === 'rectangle' || item.type === 'circle' || item.type === 'text' || item.type === 'platform'
      if (isShape && ids.length === 1) {
        const newWidth = Math.max(20, item.width * node.scaleX())
        const newHeight = Math.max(20, item.height * node.scaleY())
        node.scaleX(1)
        node.scaleY(1)
        updatedItems.push({
          ...item,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: newWidth,
          height: newHeight
        })
      } else {
        updatedItems.push({ ...item, x: node.x(), y: node.y(), rotation: node.rotation() })
      }
    }

    if (updatedItems.length > 0) {
      // Mark for post-commit forceUpdate (useLayoutEffect will pick this up after React
      // re-renders the item nodes with new dimensions)
      pendingTransformerUpdateRef.current = true
      useProjectStore.getState().pushHistory()
      window.api.items.saveMany(updatedItems)
      useProjectStore.setState((s) => ({
        items: s.items.map((i) => updatedItems.find((u) => u.id === i.id) ?? i)
      }))
    }
  }

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>): void {
    // Don't deselect if we just finished a marquee drag
    if (marqueeWasDraggedRef.current) {
      marqueeWasDraggedRef.current = false
      return
    }
    if (e.target === e.target.getStage()) {
      setSelectedIds([])
      setBackgroundSelected(false)
      setContextMenu(null)
      setColorPickerFor(null)
    }
  }

  // ── Marquee selection + panning ───────────────────────────────────────────

  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>): void {
    const isMiddle = e.evt.button === 1
    // Space+drag: only activate on empty stage background (not over items)
    const isSpaceDrag =
      e.evt.button === 0 && spaceDownRef.current && e.target === e.target.getStage()

    if (isMiddle || isSpaceDrag) {
      e.evt.preventDefault()
      const stage = stageRef.current
      if (!stage) return
      // getPointerPosition() returns screen-space coords (unaffected by scale/pan)
      const ptr = stage.getPointerPosition()
      if (!ptr) return
      isPanningRef.current = true
      panStartRef.current = {
        pointerX: ptr.x,
        pointerY: ptr.y,
        canvasX: canvasPos.x,
        canvasY: canvasPos.y
      }
      setPanCursor('grabbing')
      return
    }

    // Marquee: only on empty background with left click, not when space is held
    if (spaceDownRef.current) return
    if (e.target !== e.target.getStage()) return
    if (e.evt.button !== 0) return
    const stage = stageRef.current
    if (!stage) return
    const pos = stage.getRelativePointerPosition()
    if (!pos) return
    setMarqueeStart(pos)
    setMarqueeRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
    marqueeWasDraggedRef.current = false
  }

  function handleStageMouseMove(_e: Konva.KonvaEventObject<MouseEvent>): void {
    // Pan mode takes priority over marquee
    if (isPanningRef.current && panStartRef.current) {
      const stage = stageRef.current
      if (!stage) return
      const ptr = stage.getPointerPosition()
      if (!ptr) return
      setCanvasPos({
        x: panStartRef.current.canvasX + (ptr.x - panStartRef.current.pointerX),
        y: panStartRef.current.canvasY + (ptr.y - panStartRef.current.pointerY)
      })
      return
    }

    if (!marqueeStart || !stageRef.current) return
    const pos = stageRef.current.getRelativePointerPosition()
    if (!pos) return
    const x = Math.min(marqueeStart.x, pos.x)
    const y = Math.min(marqueeStart.y, pos.y)
    const w = Math.abs(pos.x - marqueeStart.x)
    const h = Math.abs(pos.y - marqueeStart.y)
    setMarqueeRect({ x, y, width: w, height: h })
  }

  function handleStageMouseUp(): void {
    if (isPanningRef.current) {
      isPanningRef.current = false
      panStartRef.current = null
      setPanCursor(spaceDownRef.current ? 'grab' : 'none')
      return
    }

    if (!marqueeRect || !marqueeStart) {
      setMarqueeStart(null)
      setMarqueeRect(null)
      return
    }
    if (marqueeRect.width < 5 && marqueeRect.height < 5) {
      setMarqueeStart(null)
      setMarqueeRect(null)
      return
    }
    marqueeWasDraggedRef.current = true
    const { x, y, width: mw, height: mh } = marqueeRect
    const matches = items
      .filter((item) => {
        if (CABLE_TYPES.has(item.type)) return false
        return (
          item.x < x + mw &&
          item.x + item.width > x &&
          item.y < y + mh &&
          item.y + item.height > y
        )
      })
      .map((item) => item.id)
    setSelectedIds(matches)
    setMarqueeStart(null)
    setMarqueeRect(null)
  }

  // ── Zoom ──────────────────────────────────────────────────────────────────

  function handleWheelZoom(e: Konva.KonvaEventObject<WheelEvent>): void {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const scaleBy = 1.08
    const oldScale = canvasScale
    const dir = e.evt.deltaY < 0 ? 1 : -1
    const newScale = clamp(dir > 0 ? oldScale * scaleBy : oldScale / scaleBy, 0.2, 4.0)
    const ptr = stage.getPointerPosition()
    if (!ptr) return
    const mousePointTo = {
      x: (ptr.x - canvasPos.x) / oldScale,
      y: (ptr.y - canvasPos.y) / oldScale
    }
    setCanvasScale(newScale)
    setCanvasPos({
      x: ptr.x - mousePointTo.x * newScale,
      y: ptr.y - mousePointTo.y * newScale
    })
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
      left: rect.left + item.x * canvasScale + canvasPos.x - 12,
      top: rect.top + (item.y + item.height) * canvasScale + canvasPos.y + 4,
      width: (item.width + 24) * canvasScale,
      zIndex: 100
    }
  }

  // ── Cable helpers ─────────────────────────────────────────────────────────

  function getPortPosition(it: StageItem, side: PortSide): { x: number; y: number } {
    switch (side) {
      case 'top':    return { x: it.x + it.width / 2, y: it.y }
      case 'right':  return { x: it.x + it.width,     y: it.y + it.height / 2 }
      case 'bottom': return { x: it.x + it.width / 2, y: it.y + it.height }
      case 'left':   return { x: it.x,                y: it.y + it.height / 2 }
    }
  }

  function getCablePositions(item: StageItem): {
    fromPos: { x: number; y: number }
    toPos: { x: number; y: number }
  } {
    const ex = item.extra as {
      fromId: string | null
      toId: string | null
      fromSide: PortSide | null
      toSide: PortSide | null
      x2: number
      y2: number
    }

    let fromPos: { x: number; y: number }
    if (ex.fromId) {
      const fromItem = items.find((i) => i.id === ex.fromId)
      fromPos = fromItem
        ? ex.fromSide
          ? getPortPosition(fromItem, ex.fromSide)
          : { x: fromItem.x + fromItem.width / 2, y: fromItem.y + fromItem.height / 2 }
        : { x: item.x, y: item.y }
    } else {
      fromPos = { x: item.x, y: item.y }
    }

    let toPos: { x: number; y: number }
    if (ex.toId) {
      const toItem = items.find((i) => i.id === ex.toId)
      toPos = toItem
        ? ex.toSide
          ? getPortPosition(toItem, ex.toSide)
          : { x: toItem.x + toItem.width / 2, y: toItem.y + toItem.height / 2 }
        : { x: ex.x2, y: ex.y2 }
    } else {
      toPos = { x: ex.x2, y: ex.y2 }
    }

    return { fromPos, toPos }
  }

  function handleCableBodyDragEnd(cable: StageItem, dx: number, dy: number): void {
    const ex = cable.extra as {
      fromId: string | null
      toId: string | null
      fromSide: PortSide | null
      toSide: PortSide | null
      x2: number
      y2: number
    }
    const updated: StageItem = {
      ...cable,
      x: cable.x + dx,
      y: cable.y + dy,
      extra: {
        fromId: null,
        toId: null,
        fromSide: null,
        toSide: null,
        x2: ex.x2 + dx,
        y2: ex.y2 + dy
      }
    }
    useProjectStore.getState().pushHistory()
    window.api.items.save(updated)
    useProjectStore.setState((s) => ({
      items: s.items.map((i) => (i.id === updated.id ? updated : i))
    }))
  }

  function handleEndpointDragMove(
    _cable: StageItem,
    _endpoint: 'from' | 'to',
    x: number,
    y: number
  ): void {
    const SNAP_DIST = 40
    let nearestItemId: string | null = null
    let nearestSide: PortSide | null = null
    let nearestDist = Infinity

    for (const it of items) {
      if (CABLE_TYPES.has(it.type)) continue
      const ports: Array<{ side: PortSide; px: number; py: number }> = [
        { side: 'top',    px: it.x + it.width / 2, py: it.y },
        { side: 'right',  px: it.x + it.width,     py: it.y + it.height / 2 },
        { side: 'bottom', px: it.x + it.width / 2, py: it.y + it.height },
        { side: 'left',   px: it.x,                py: it.y + it.height / 2 }
      ]
      for (const port of ports) {
        const d = Math.hypot(port.px - x, port.py - y)
        if (d < SNAP_DIST && d < nearestDist) {
          nearestDist = d
          nearestItemId = it.id
          nearestSide = port.side
        }
      }
    }

    const newSnap =
      nearestItemId && nearestSide ? { id: nearestItemId, side: nearestSide } : null
    // Write ref immediately — avoids stale read in onDragEnd on quick release
    snapTargetRef.current = newSnap
    if (newSnap?.id !== snapTarget?.id || newSnap?.side !== snapTarget?.side) {
      setSnapTarget(newSnap)
    }
  }

  function handleEndpointDragEnd(
    cable: StageItem,
    endpoint: 'from' | 'to',
    x: number,
    y: number
  ): void {
    const snap = snapTargetRef.current
    const ex = cable.extra as {
      fromId: string | null
      toId: string | null
      fromSide: PortSide | null
      toSide: PortSide | null
      x2: number
      y2: number
    }

    // Resolve the snapped port position so we store it as the free-endpoint
    // fallback (used when the cable is later disconnected via body drag)
    const snapItem = snap ? items.find((i) => i.id === snap.id) : null
    const snapPos  = snapItem && snap ? getPortPosition(snapItem, snap.side) : null

    let updated: StageItem
    if (endpoint === 'from') {
      updated = {
        ...cable,
        x: snapPos ? snapPos.x : x,
        y: snapPos ? snapPos.y : y,
        extra: { ...ex, fromId: snap?.id ?? null, fromSide: snap?.side ?? null }
      }
    } else {
      updated = {
        ...cable,
        extra: {
          ...ex,
          toId:   snap?.id   ?? null,
          toSide: snap?.side ?? null,
          x2: snapPos ? snapPos.x : x,
          y2: snapPos ? snapPos.y : y
        }
      }
    }
    useProjectStore.getState().pushHistory()
    window.api.items.save(updated)
    useProjectStore.setState((s) => ({
      items: s.items.map((i) => (i.id === updated.id ? updated : i))
    }))
    snapTargetRef.current = null
    setSnapTarget(null)
  }

  // ── Grid ──────────────────────────────────────────────────────────────────

  const gridLines = useCallback(() => {
    const lines: JSX.Element[] = []
    for (let i = 0; i <= Math.ceil(width / GRID_SIZE); i++) {
      lines.push(
        <Rect key={`v${i}`} x={i * GRID_SIZE} y={0} width={1} height={height} fill={colors.grid} />
      )
    }
    for (let i = 0; i <= Math.ceil(height / GRID_SIZE); i++) {
      lines.push(
        <Rect key={`h${i}`} x={0} y={i * GRID_SIZE} width={width} height={1} fill={colors.grid} />
      )
    }
    return lines
  }, [width, height, colors.grid])

  const editingItem = editingId ? items.find((i) => i.id === editingId) : null
  const colorPickerItem = colorPickerFor ? items.find((i) => i.id === colorPickerFor) : null
  const isCableType = (type: string) => CABLE_TYPES.has(type)
  const contextMenuItem = contextMenu ? items.find((i) => i.id === contextMenu.itemId) : null

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        cursor:
          panCursor === 'grabbing' ? 'grabbing' : panCursor === 'grab' ? 'grab' : undefined
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={canvasScale}
        scaleY={canvasScale}
        x={canvasPos.x}
        y={canvasPos.y}
        style={{ background: colors.bg }}
        onClick={handleStageClick}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={handleWheelZoom}
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
            y={height - GRID_SIZE / 2 - 7}
            text={t('canvas.frontOfStage')}
            fontSize={11}
            fill={colors.stageText}
            fontStyle="bold"
            letterSpacing={2}
          />
        </Layer>

        {/* Items + Transformer */}
        <Layer>
          {/* Background image — rendered below everything, interactive when unlocked */}
          {bgHtmlImg && backgroundWidth && backgroundHeight && (
            <KonvaImage
              ref={(node) => { bgImageRef.current = node }}
              image={bgHtmlImg}
              x={backgroundX ?? 0}
              y={backgroundY ?? 0}
              width={backgroundWidth}
              height={backgroundHeight}
              opacity={backgroundLocked ? 0.55 : 0.7}
              draggable={!backgroundLocked}
              listening={!backgroundLocked}
              onClick={(e) => {
                e.cancelBubble = true
                setBackgroundSelected(true)
                setSelectedIds([])
                setContextMenu(null)
              }}
              onDragEnd={(e) => {
                useProjectStore.getState().setBackgroundTransform(
                  e.target.x(),
                  e.target.y(),
                  backgroundWidth,
                  backgroundHeight
                )
              }}
            />
          )}

          {/* Cables rendered first (always below instruments) */}
          {sortedItems
            .filter((item) => CABLE_TYPES.has(item.type))
            .map((cable) => {
              const { fromPos, toPos } = getCablePositions(cable)
              return (
                <CableNode
                  key={cable.id}
                  item={cable}
                  fromPos={fromPos}
                  toPos={toPos}
                  isSelected={selectedIds.includes(cable.id)}
                  onSelect={(e) => {
                    setBackgroundSelected(false)
                    selectItem(cable.id, e.evt.shiftKey)
                  }}
                  onContextMenu={(x, y) => {
                    if (!selectedIds.includes(cable.id)) setSelectedIds([cable.id])
                    setContextMenu({ x, y, itemId: cable.id })
                  }}
                  onBodyDragEnd={(dx, dy) => handleCableBodyDragEnd(cable, dx, dy)}
                  onEndpointDragMove={(ep, x, y) => handleEndpointDragMove(cable, ep, x, y)}
                  onEndpointDragEnd={(ep, x, y) => handleEndpointDragEnd(cable, ep, x, y)}
                />
              )
            })}

          {/* Snap-to port highlight */}
          {snapTarget && (() => {
            const snapItem = items.find((i) => i.id === snapTarget.id)
            if (!snapItem) return null
            const pos = getPortPosition(snapItem, snapTarget.side)
            return (
              <Circle
                x={pos.x}
                y={pos.y}
                radius={10}
                stroke="#6496ff"
                strokeWidth={2.5}
                fill="rgba(100,150,255,0.35)"
                listening={false}
              />
            )
          })()}

          {/* Instrument + shape + text items — rendered in sort_order (lower = below) */}
          {sortedItems
            .filter((item) => !CABLE_TYPES.has(item.type))
            .map((item) => {
              if (item.type === 'text') {
                return (
                  <TextNode
                    key={item.id}
                    item={item}
                    isSelected={selectedIds.includes(item.id)}
                    labelColor={colors.label}
                    nodeRef={(node) => {
                      if (node) nodeRefs.current.set(item.id, node)
                      else nodeRefs.current.delete(item.id)
                    }}
                    onSelect={(e) => {
                      setBackgroundSelected(false)
                      selectItem(item.id, e.evt.shiftKey)
                    }}
                    onDragStart={(_e) => {
                      if (!selectedIdsRef.current.includes(item.id)) {
                        selectItem(item.id, false)
                      }
                    }}
                    onDragMove={(e) => handleDragMove(item, e)}
                    onDragEnd={(e) => handleDragEnd(item, e)}
                    onContextMenu={(x, y) => {
                      if (!selectedIds.includes(item.id)) setSelectedIds([item.id])
                      setContextMenu({ x, y, itemId: item.id })
                    }}
                    onDblClick={() => startEditing(item)}
                  />
                )
              }
              return (
                <StageItemNode
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.includes(item.id)}
                  labelColor={colors.label}
                  selectedLabelColor={colors.labelSelected}
                  nodeRef={(node) => {
                    if (node) nodeRefs.current.set(item.id, node)
                    else nodeRefs.current.delete(item.id)
                  }}
                  onSelect={(e) => {
                    setBackgroundSelected(false)
                    selectItem(item.id, e.evt.shiftKey)
                  }}
                  onDragStart={(_e) => {
                    if (!selectedIdsRef.current.includes(item.id)) {
                      selectItem(item.id, false)
                    }
                  }}
                  onDragMove={(e) => handleDragMove(item, e)}
                  onDragEnd={(e) => handleDragEnd(item, e)}
                  onContextMenu={(x, y) => {
                    if (!selectedIds.includes(item.id)) setSelectedIds([item.id])
                    setContextMenu({ x, y, itemId: item.id })
                  }}
                  onDblClick={() => startEditing(item)}
                />
              )
            })}

          {/* Marquee selection rect */}
          {marqueeRect && marqueeRect.width > 0 && (
            <Rect
              x={marqueeRect.x}
              y={marqueeRect.y}
              width={marqueeRect.width}
              height={marqueeRect.height}
              fill="rgba(100,150,255,0.15)"
              stroke="#6496ff"
              dash={[4, 3]}
              listening={false}
            />
          )}

          <Transformer
            ref={trRef}
            resizeEnabled={isSelectedShape || backgroundSelected}
            keepRatio={singleSelected?.type === 'circle' || backgroundSelected}
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

      {/* Color picker popover */}
      {colorPickerItem && containerRef.current && !isCableType(colorPickerItem.type) && (
        <ColorPickerPopover
          item={colorPickerItem}
          canvasPos={canvasPos}
          canvasScale={canvasScale}
          containerRect={containerRef.current.getBoundingClientRect()}
          onSelect={(color) => {
            const item = items.find((i) => i.id === colorPickerFor)
            if (item) updateItem({ ...item, color })
          }}
          onDismiss={() => setColorPickerFor(null)}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-surface border border-border rounded-lg shadow-2xl py-1 min-w-44 overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {selectedIds.length === 1 && contextMenuItem && !isCableType(contextMenuItem.type) && (
            <>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => {
                  if (contextMenuItem) startEditing(contextMenuItem)
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
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => {
                  setColorPickerFor(contextMenu.itemId)
                  setContextMenu(null)
                }}
              >
                🎨 {t('contextMenu.changeColor')}
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => { void bringToFront(contextMenu.itemId); setContextMenu(null) }}
              >
                ⬆️ {t('contextMenu.bringToFront')}
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => { void sendToBack(contextMenu.itemId); setContextMenu(null) }}
              >
                ⬇️ {t('contextMenu.sendToBack')}
              </button>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => { void toggleLayerLock(contextMenu.itemId); setContextMenu(null) }}
              >
                {(contextMenuItem.extra as Record<string, unknown> | null)?.layerLocked
                  ? `🔓 ${t('contextMenu.unlockLayer')}`
                  : `🔒 ${t('contextMenu.lockLayer')}`}
              </button>
              <div className="h-px bg-border mx-2 my-1" />
            </>
          )}
          {selectedIds.length === 1 && contextMenuItem && isCableType(contextMenuItem.type) && (
            <>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => {
                  setColorPickerFor(contextMenu.itemId)
                  setContextMenu(null)
                }}
              >
                🎨 {t('contextMenu.changeColor')}
              </button>
              <div className="h-px bg-border mx-2 my-1" />
            </>
          )}
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => {
              deleteItems(selectedIds)
              setSelectedIds([])
              setContextMenu(null)
            }}
          >
            🗑{' '}
            {selectedIds.length > 1
              ? t('contextMenu.deleteSelected', { count: selectedIds.length })
              : t('contextMenu.delete')}
          </button>
        </div>
      )}

      {/* Hint bar */}
      {selectedIds.length > 0 && !editingId && !contextMenu && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted bg-surface/80 px-3 py-1.5 rounded-full pointer-events-none select-none whitespace-nowrap">
          {selectedIds.length === 1
            ? t('canvas.hint')
            : t('canvas.hintMulti', { count: selectedIds.length })}
        </div>
      )}

    </div>
  )
}
