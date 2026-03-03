import { Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { StageItem } from '../../../../shared/types'

interface TextNodeProps {
  item: StageItem
  isSelected: boolean
  labelColor: string
  nodeRef: (node: Konva.Group | null) => void
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onContextMenu: (x: number, y: number) => void
  onDblClick: () => void
}

export function TextNode({
  item,
  isSelected,
  labelColor,
  nodeRef,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onContextMenu,
  onDblClick
}: TextNodeProps): JSX.Element {
  const extra = (item.extra as { fontSize?: number; fontStyle?: string } | null) ?? {}
  const fontSize = extra.fontSize ?? 16
  const fontStyle = extra.fontStyle ?? 'normal'
  const textColor = item.color ?? labelColor

  function handleContextMenu(e: Konva.KonvaEventObject<PointerEvent>): void {
    e.evt.preventDefault()
    onContextMenu(e.evt.clientX, e.evt.clientY)
  }

  return (
    <Group
      ref={nodeRef}
      x={item.x}
      y={item.y}
      rotation={item.rotation ?? 0}
      draggable
      onClick={onSelect}
      onDblClick={onDblClick}
      onContextMenu={handleContextMenu}
      onDragEnd={onDragEnd}
      onDragMove={onDragMove}
      onDragStart={onDragStart}
    >
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={item.width + 8}
          height={item.height + 8}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
          dash={[4, 3]}
          fill="transparent"
        />
      )}
      <Text
        width={item.width}
        height={item.height}
        text={item.label}
        fontSize={fontSize}
        fontStyle={fontStyle}
        fill={textColor}
        wrap="word"
      />
    </Group>
  )
}
