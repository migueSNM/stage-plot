import { useRef, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Group, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useProjectStore } from '../../store/useProjectStore'
import { StageItemNode } from './StageItemNode'
import type { StageItem } from '../../../../shared/types'

const STAGE_BG = '#0d0d1a'
const GRID_COLOR = '#1e1e3a'
const GRID_SIZE = 40

interface StageCanvasProps {
  width: number
  height: number
}

export function StageCanvas({ width, height }: StageCanvasProps): JSX.Element {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const { items, updateItemPosition } = useProjectStore()

  const gridLines = useCallback(() => {
    const lines: JSX.Element[] = []
    const cols = Math.ceil(width / GRID_SIZE)
    const rows = Math.ceil(height / GRID_SIZE)

    for (let i = 0; i <= cols; i++) {
      lines.push(
        <Rect
          key={`v${i}`}
          x={i * GRID_SIZE}
          y={0}
          width={1}
          height={height}
          fill={GRID_COLOR}
        />
      )
    }
    for (let i = 0; i <= rows; i++) {
      lines.push(
        <Rect
          key={`h${i}`}
          x={0}
          y={i * GRID_SIZE}
          width={width}
          height={1}
          fill={GRID_COLOR}
        />
      )
    }
    return lines
  }, [width, height])

  function handleDragEnd(item: StageItem, e: Konva.KonvaEventObject<DragEvent>): void {
    const node = e.target
    updateItemPosition(item.id, node.x(), node.y())
  }

  return (
    <Stage ref={stageRef} width={width} height={height} style={{ background: STAGE_BG }}>
      {/* Grid layer */}
      <Layer listening={false}>
        <Rect x={0} y={0} width={width} height={height} fill={STAGE_BG} />
        {gridLines()}
        {/* Stage edge indicator */}
        <Rect
          x={GRID_SIZE}
          y={GRID_SIZE}
          width={width - GRID_SIZE * 2}
          height={height - GRID_SIZE * 2}
          stroke="#2a2a5a"
          strokeWidth={2}
          dash={[10, 5]}
          fill="transparent"
          listening={false}
        />
        <Text
          x={width / 2 - 30}
          y={GRID_SIZE / 2 - 8}
          text="FRONT OF STAGE"
          fontSize={12}
          fill="#3a3a6a"
          fontStyle="bold"
        />
      </Layer>

      {/* Items layer */}
      <Layer>
        {items.map((item) => (
          <StageItemNode
            key={item.id}
            item={item}
            onDragEnd={(e) => handleDragEnd(item, e)}
          />
        ))}
        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  )
}
