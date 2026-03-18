import { useState } from 'react'
import { Group, Line, Circle, Text } from 'react-konva'
import type Konva from 'konva'
import type { StageItem } from '../../../../shared/types'

export const CABLE_DEFAULT_COLOR = '#cccccc'

/** All cables default to the same neutral color — users set custom colors via the color picker */
export const CABLE_COLORS: Record<string, string> = {
  cable_xlr: CABLE_DEFAULT_COLOR,
  cable_trs: CABLE_DEFAULT_COLOR,
  cable_ts: CABLE_DEFAULT_COLOR,
  cable_midi: CABLE_DEFAULT_COLOR,
  cable_speakon: CABLE_DEFAULT_COLOR
}

const CABLE_LABELS: Record<string, string> = {
  cable_xlr: 'XLR',
  cable_trs: 'TRS',
  cable_ts: 'TS',
  cable_midi: 'MIDI',
  cable_speakon: 'Speakon'
}

export type PortSide = 'top' | 'right' | 'bottom' | 'left'

/** Unit vector pointing away from an item face (the direction a cable exits). */
function exitVector(side: PortSide): { dx: number; dy: number } {
  switch (side) {
    case 'right':  return { dx: 1,  dy: 0  }
    case 'left':   return { dx: -1, dy: 0  }
    case 'top':    return { dx: 0,  dy: -1 }
    case 'bottom': return { dx: 0,  dy: 1  }
  }
}

/** Minimum distance the cable travels straight out of each port before turning. */
const STUB = 20

/**
 * Build an orthogonal path between two endpoints.
 *
 * Strategy — stubs first, then connect p1→p2:
 *
 *  • p1  = from + STUB in exit direction   (guaranteed outside from-item edge)
 *  • p2  = to   + STUB in exit direction   (guaranteed outside to-item edge)
 *
 * For LEFT/RIGHT ports the stub moves horizontally, so p1.x / p2.x are safe
 * X-coordinates that lie outside the respective items.
 * For TOP/BOTTOM ports the stub moves vertically, so p1.y / p2.y are safe
 * Y-coordinates outside the items; p1.x/p2.x sit at the item centre.
 *
 * Connecting p1→p2:
 *  • 0 bends  — already axis-aligned
 *  • 1 bend   — normal L-shape (non-backtracking case)
 *  • 2 bends  — backtrack case: use the safe stub coordinates as the outer
 *               corners so the path routes around both items:
 *
 *    horizFirst + backtrack → corner at (p1.x, p2.y)
 *      p1.x is outside the from-item edge; p2.y is outside the to-item edge.
 *      Result: stub-left → down-at-p1.x → right-at-p2.y → stub-up → port  ✓
 *
 *    vertFirst  + backtrack → corner at (safeX, p1.y) then (safeX, p2.y)
 *      safeX is picked clear of both item centres.
 */
function getRoutedPoints(
  from: { x: number; y: number },
  fromSide: PortSide | null,
  to: { x: number; y: number },
  toSide: PortSide | null
): number[] {
  const fv = fromSide ? exitVector(fromSide) : null
  const tv = toSide   ? exitVector(toSide)   : null

  // Stub waypoints — STUB px outside each port face
  const p1 = fv
    ? { x: from.x + fv.dx * STUB, y: from.y + fv.dy * STUB }
    : { ...from }
  const p2 = tv
    ? { x: to.x + tv.dx * STUB, y: to.y + tv.dy * STUB }
    : { ...to }

  const pts: number[] = [from.x, from.y]
  if (fv) pts.push(p1.x, p1.y)

  const dx = Math.abs(p1.x - p2.x)
  const dy = Math.abs(p1.y - p2.y)

  // Which axis to route along first (same as exit direction).
  const horizFirst = fv ? fv.dx !== 0 : true

  if (dx < 1 && dy < 1) {
    // p1 and p2 coincide — nothing to add between stubs

  } else if (horizFirst) {
    // ── Horizontal exit (left / right port) ───────────────────────────────
    if (dx < 1) {
      // Same x — go straight vertical
      pts.push(p2.x, p2.y)
    } else if (dy < 1) {
      // Same y — detect same-direction backtrack (e.g. right→right same row)
      if (fv && fv.dx * (p2.x - p1.x) < 0) {
        // U-bump downward by enough to clear the items (items are ~60-70 px tall,
        // so STUB*3 = 60 px places the bump below the item centre + half-height).
        const bumpY = p1.y + STUB * 3
        pts.push(p1.x, bumpY, p2.x, bumpY)
      }
      pts.push(p2.x, p2.y)
    } else if (fv && fv.dx * (p2.x - p1.x) < 0) {
      // ── BACKTRACK ─────────────────────────────────────────────────────
      // The horizontal exit goes in the wrong direction toward the target.
      // p1.x is safe (stub end, outside the from-item horizontal edge).
      // p2.y is only safe when the to-port is vertical (top/bottom) —
      // for horizontal to-ports (left/right), p2.y sits at item centre Y.
      if (tv && tv.dy === 0) {
        // Horizontal to-port: p2.y is item centre Y (unsafe as a corner).
        // Route below both items — safeY clears half-heights from centre.
        const safeY = Math.max(p1.y, p2.y) + STUB * 3
        pts.push(p1.x, safeY, p2.x, safeY, p2.x, p2.y)
      } else {
        // Vertical to-port or free endpoint: p2.y is outside to-item ✓
        // Three 90° turns: stub → vertical@p1.x → horizontal@p2.y → stub → port
        pts.push(p1.x, p2.y, p2.x, p2.y)
      }
    } else {
      pts.push(p2.x, p1.y, p2.x, p2.y) // normal L-shape: horizontal → vertical
    }

  } else {
    // ── Vertical exit (top / bottom port) ─────────────────────────────────
    if (dy < 1) {
      // Same y — go straight horizontal
      pts.push(p2.x, p2.y)
    } else if (dx < 1) {
      // Same x — detect same-direction backtrack
      if (fv && fv.dy * (p2.y - p1.y) < 0) {
        // U-bump rightward by enough to clear the items
        const bumpX = p1.x + STUB * 3
        pts.push(bumpX, p1.y, bumpX, p2.y)
      }
      pts.push(p2.x, p2.y)
    } else if (fv && fv.dy * (p2.y - p1.y) < 0) {
      // Backtracking vertically (e.g. top→bottom where target is below source,
      // or bottom→top where target is above source).
      // For top/bottom ports, p1.x/p2.x sit at item centres (unsafe as corners).
      // Pick safeX: when items are well-separated use the midpoint (between them);
      // when they're close, go clear to one side.
      const spread = Math.abs(p1.x - p2.x)
      const safeX =
        spread >= STUB * 4
          ? (p1.x + p2.x) / 2              // midpoint clears both items
          : Math.min(p1.x, p2.x) - STUB * 3 // go left of both items
      pts.push(safeX, p1.y, safeX, p2.y, p2.x, p2.y)
    } else {
      pts.push(p1.x, p2.y, p2.x, p2.y) // normal L-shape: vertical → horizontal
    }
  }

  if (tv) pts.push(to.x, to.y)

  return pts
}

/**
 * From a flat Konva points array [x0,y0, x1,y1, ...] find the longest segment
 * and return its midpoint + whether it is more vertical than horizontal.
 */
function longestSegmentInfo(pts: number[]): {
  midX: number
  midY: number
  isVertical: boolean
} {
  let bestLen = -1
  let bestMidX = pts[0] ?? 0
  let bestMidY = pts[1] ?? 0
  let bestVertical = false

  for (let i = 0; i < pts.length - 2; i += 2) {
    const ax = pts[i],  ay = pts[i + 1]
    const bx = pts[i + 2], by = pts[i + 3]
    const dx = bx - ax
    const dy = by - ay
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > bestLen) {
      bestLen = len
      bestMidX = (ax + bx) / 2
      bestMidY = (ay + by) / 2
      bestVertical = Math.abs(dy) > Math.abs(dx)
    }
  }

  return { midX: bestMidX, midY: bestMidY, isVertical: bestVertical }
}

interface CableNodeProps {
  item: StageItem
  fromPos: { x: number; y: number }
  toPos: { x: number; y: number }
  isSelected: boolean
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onContextMenu: (x: number, y: number) => void
  onBodyDragEnd: (dx: number, dy: number) => void
  onEndpointDragEnd: (endpoint: 'from' | 'to', x: number, y: number) => void
  onEndpointDragMove: (endpoint: 'from' | 'to', x: number, y: number) => void
}

export function CableNode({
  item,
  fromPos,
  toPos,
  isSelected,
  onSelect,
  onContextMenu,
  onBodyDragEnd,
  onEndpointDragEnd,
  onEndpointDragMove
}: CableNodeProps): JSX.Element {
  const color = item.color ?? CABLE_COLORS[item.type] ?? CABLE_DEFAULT_COLOR

  const ex = (item.extra ?? {}) as {
    fromSide?: PortSide | null
    toSide?: PortSide | null
  }
  const fromSide = ex.fromSide ?? null
  const toSide   = ex.toSide   ?? null

  const [isHovered, setIsHovered] = useState(false)

  // Live endpoint positions during endpoint-circle drag (real-time line update)
  const [liveFrom, setLiveFrom] = useState<{ x: number; y: number } | null>(null)
  const [liveTo,   setLiveTo]   = useState<{ x: number; y: number } | null>(null)

  // Body drag offset — circles follow the translating line
  const [bodyDelta, setBodyDelta] = useState<{ dx: number; dy: number } | null>(null)

  // While an endpoint is being dragged we don't know the new port yet,
  // so use simple L-shape. Once the drag commits the stored sides kick in.
  const linePoints =
    liveFrom || liveTo
      ? getRoutedPoints(liveFrom ?? fromPos, null, liveTo ?? toPos, null)
      : getRoutedPoints(fromPos, fromSide, toPos, toSide)

  const circleFromX = bodyDelta ? fromPos.x + bodyDelta.dx : fromPos.x
  const circleFromY = bodyDelta ? fromPos.y + bodyDelta.dy : fromPos.y
  const circleToX   = bodyDelta ? toPos.x + bodyDelta.dx   : toPos.x
  const circleToY   = bodyDelta ? toPos.y + bodyDelta.dy   : toPos.y

  function handleContextMenu(e: Konva.KonvaEventObject<PointerEvent>): void {
    e.evt.preventDefault()
    onContextMenu(e.evt.clientX, e.evt.clientY)
  }

  const labelText = CABLE_LABELS[item.type] ?? item.type

  // During body drag the Line node itself translates — recompute routed points
  // from the shifted positions so the label tracks the visual cable.
  const labelLinePoints = bodyDelta
    ? getRoutedPoints(
        { x: fromPos.x + bodyDelta.dx, y: fromPos.y + bodyDelta.dy },
        fromSide,
        { x: toPos.x + bodyDelta.dx, y: toPos.y + bodyDelta.dy },
        toSide
      )
    : linePoints // already accounts for liveFrom / liveTo

  const { midX, midY, isVertical: isMoreVertical } = longestSegmentInfo(labelLinePoints)

  // Label fits in a 60px wide text box, offset 10px away from the cable
  const LABEL_BOX = 60
  const LABEL_GAP = 10

  return (
    <Group>
      {/* Cable line — Konva translates this node during body drag */}
      <Line
        points={linePoints}
        stroke={color}
        strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
        hitStrokeWidth={12}
        lineJoin="round"
        shadowColor={color}
        shadowBlur={isSelected ? 8 : isHovered ? 5 : 3}
        shadowOpacity={isSelected ? 0.5 : isHovered ? 0.35 : 0.2}
        draggable
        onClick={(e) => onSelect(e as unknown as Konva.KonvaEventObject<MouseEvent>)}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragStart={(e) => {
          onSelect(e as unknown as Konva.KonvaEventObject<MouseEvent>)
        }}
        onDragMove={(e) => {
          setBodyDelta({ dx: e.target.x(), dy: e.target.y() })
        }}
        onDragEnd={(e) => {
          const dx = e.target.x()
          const dy = e.target.y()
          setBodyDelta(null)
          e.target.x(0)
          e.target.y(0)
          onBodyDragEnd(dx, dy)
        }}
      />

      {/* Cable type label — horizontal below midpoint, or rotated beside for vertical cables */}
      {isMoreVertical ? (
        <Text
          x={midX + LABEL_GAP}
          y={midY}
          width={LABEL_BOX}
          text={labelText}
          fontSize={10}
          fill={color}
          align="center"
          offsetX={LABEL_BOX / 2}
          rotation={-90}
          listening={false}
        />
      ) : (
        <Text
          x={midX - LABEL_BOX / 2}
          y={midY + LABEL_GAP}
          width={LABEL_BOX}
          text={labelText}
          fontSize={10}
          fill={color}
          align="center"
          listening={false}
        />
      )}

      {/* Endpoint handles — visible when selected */}
      {isSelected && (
        <>
          <Circle
            x={circleFromX}
            y={circleFromY}
            radius={7}
            fill={color}
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              setLiveFrom({ x: e.target.x(), y: e.target.y() })
              onEndpointDragMove('from', e.target.x(), e.target.y())
            }}
            onDragEnd={(e) => {
              const x = e.target.x()
              const y = e.target.y()
              setLiveFrom(null)
              e.target.x(circleFromX)
              e.target.y(circleFromY)
              onEndpointDragEnd('from', x, y)
            }}
          />
          <Circle
            x={circleToX}
            y={circleToY}
            radius={7}
            fill={color}
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              setLiveTo({ x: e.target.x(), y: e.target.y() })
              onEndpointDragMove('to', e.target.x(), e.target.y())
            }}
            onDragEnd={(e) => {
              const x = e.target.x()
              const y = e.target.y()
              setLiveTo(null)
              e.target.x(circleToX)
              e.target.y(circleToY)
              onEndpointDragEnd('to', x, y)
            }}
          />
        </>
      )}
    </Group>
  )
}
