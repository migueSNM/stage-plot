import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { Stage, Layer, Rect, Transformer, Circle, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import { StageItemNode } from './StageItemNode'
import { CableNode } from './CableNode'
import { TextNode } from './TextNode'
import { ColorPickerPopover } from './ColorPickerPopover'
import { GridLayer, CANVAS_COLORS } from './GridLayer'
import { ContextMenu, type ContextMenuData } from './ContextMenu'
import { getCablePositions, getPortPosition } from '../../utils/cableUtils'
import { useWheelZoom } from '../../hooks/useWheelZoom'
import { useExportHandlers } from '../../hooks/useExportHandlers'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useCableHandlers } from '../../hooks/useCableHandlers'
import type { StageItem, PortSide } from '../../../../shared/types'
import { isCableType, getCableExtra, isLayerLocked, getTextExtra } from '../../../../shared/itemExtras'

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
  const colors = CANVAS_COLORS

  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const nodeRefs = useRef(new Map<string, Konva.Group>())

  const {
    items,
    activeProject,
    patchRows,
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
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null)
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
  // All non-cable items support resize; cables don't
  const isSelectedShape = singleSelected !== null && !isCableType(singleSelected.type)

  // ── Hooks ─────────────────────────────────────────────────────────────────

  useExportHandlers({ stageRef, activeProject, patchRows, registerExport })

  useKeyboardShortcuts({
    editingIdRef,
    selectedIdsRef,
    spaceDownRef,
    isPanningRef,
    arrowHeldRef,
    deleteItems,
    updateItem,
    nudgeItem,
    nudgeItems,
    setSelectedIds,
    setBackgroundSelected,
    closeContextMenu: () => setContextMenu(null),
    closeColorPicker: () => setColorPickerFor(null),
    setPanCursor
  })

  const handleWheelZoom = useWheelZoom({ stageRef, canvasScale, canvasPos, setCanvasScale, setCanvasPos })

  const { handleCableBodyDragEnd, handleEndpointDragMove, handleEndpointDragEnd } = useCableHandlers({
    items,
    snapTarget,
    setSnapTarget,
    snapTargetRef
  })

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
        return item && !isCableType(item.type)
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
      if (item && !isLayerLocked(item)) {
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
          const cableEx = getCableExtra(it)
          if (cableEx) {
            return {
              ...base,
              extra: {
                ...cableEx,
                x2: cableEx.x2 + dx,
                y2: cableEx.y2 + dy,
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

      if (ids.length === 1) {
        const sx = node.scaleX()
        const sy = node.scaleY()
        const newWidth = Math.max(20, item.width * sx)
        const newHeight = Math.max(20, item.height * sy)
        node.scaleX(1)
        node.scaleY(1)
        const baseUpdate = {
          ...item,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: newWidth,
          height: newHeight
        }
        if (item.type === 'text') {
          const textEx = getTextExtra(item)
          const newFontSize = Math.max(6, Math.round(textEx.fontSize * sy))
          updatedItems.push({ ...baseUpdate, extra: { ...textEx, fontSize: newFontSize } })
        } else {
          updatedItems.push(baseUpdate)
        }
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
        if (isCableType(item.type)) return false
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

  const editingItem = editingId ? items.find((i) => i.id === editingId) : null
  const colorPickerItem = colorPickerFor ? items.find((i) => i.id === colorPickerFor) : null
  const contextMenuItem = contextMenu ? items.find((i) => i.id === contextMenu.itemId) : undefined

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
        <GridLayer
          width={width}
          height={height}
          colors={colors}
          frontOfStageLabel={t('canvas.frontOfStage')}
        />

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
            .filter((item) => isCableType(item.type))
            .map((cable) => {
              const { fromPos, toPos } = getCablePositions(cable, items)
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
            .filter((item) => !isCableType(item.type))
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
                  onDblClick={() => {}}
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
            keepRatio={
              backgroundSelected ||
              // Rectangles and platforms are the only free-form shapes; everything else keeps ratio
              (singleSelected !== null &&
                singleSelected.type !== 'rectangle' &&
                singleSelected.type !== 'platform')
            }
            rotateEnabled={true}
            rotationSnaps={[0, 90, 180, 270]}
            rotationSnapTolerance={10}
            borderStroke='rgba(0,0,0,0.25)'
            borderStrokeWidth={1}
            borderDash={[4, 4]}
            anchorStroke='#333333'
            anchorFill='#ffffff'
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
        <ContextMenu
          contextMenu={contextMenu}
          selectedIds={selectedIds}
          contextMenuItem={contextMenuItem}
          onStartEditing={startEditing}
          onRotate={(deg) => {
            const item = items.find((i) => i.id === contextMenu.itemId)
            if (item) updateItem({ ...item, rotation: ((item.rotation ?? 0) + deg + 360) % 360 })
            setContextMenu(null)
          }}
          onChangeColor={(itemId) => setColorPickerFor(itemId)}
          onBringToFront={(id) => void bringToFront(id)}
          onSendToBack={(id) => void sendToBack(id)}
          onToggleLock={(id) => void toggleLayerLock(id)}
          onDelete={(ids) => { deleteItems(ids); setSelectedIds([]) }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Hint bar */}
      {selectedIds.length > 0 && !editingId && !contextMenu && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-muted bg-surface/80 px-3 py-1.5 rounded-full pointer-events-none select-none whitespace-nowrap">
          {selectedIds.length === 1
            ? t('canvas.hint')
            : t('canvas.hintMulti', { count: selectedIds.length })}
        </div>
      )}

    </div>
  )
}
