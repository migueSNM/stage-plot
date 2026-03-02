import { Group, Rect, Circle, Text } from 'react-konva'
import type Konva from 'konva'
import type { StageItem, StageItemType } from '../../../../shared/types'

export const LABEL_HEIGHT = 22

const ITEM_COLORS: Record<StageItemType, string> = {
  microphone: '#e94560',
  monitor: '#f5a623',
  amp: '#7ed321',
  keyboard: '#4a90e2',
  drums: '#9b59b6',
  di_box: '#1abc9c',
  speaker_main: '#e67e22',
  person: '#3498db',
  generic: '#95a5a6',
  rectangle: '#8a9ec0',
  circle: '#a08ac0'
}

export const ITEM_ICONS: Record<StageItemType, string> = {
  microphone: '🎙',
  monitor: '📢',
  amp: '🔊',
  keyboard: '🎹',
  drums: '🥁',
  di_box: '📦',
  speaker_main: '📯',
  person: '🎤',
  generic: '⬜',
  rectangle: '',
  circle: ''
}

interface StageItemNodeProps {
  item: StageItem
  isSelected: boolean
  labelColor: string
  selectedLabelColor: string
  nodeRef: (node: Konva.Group | null) => void
  onSelect: () => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onContextMenu: (x: number, y: number) => void
  onDblClick: () => void
}

export function StageItemNode({
  item,
  isSelected,
  labelColor,
  selectedLabelColor,
  nodeRef,
  onSelect,
  onDragEnd,
  onContextMenu,
  onDblClick
}: StageItemNodeProps): JSX.Element {
  const color = item.color ?? ITEM_COLORS[item.type]
  const { width, height } = item
  const isShape = item.type === 'rectangle' || item.type === 'circle'
  const isCircular = item.type === 'microphone' || item.type === 'person' || item.type === 'circle'
  const iconFontSize = Math.min(width, height) * 0.45

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
      onDragStart={onSelect}
    >
      {isCircular ? (
        <Circle
          x={width / 2}
          y={height / 2}
          radius={Math.min(width, height) / 2}
          fill={isShape ? 'transparent' : color}
          opacity={isShape ? 1 : 0.85}
          shadowBlur={isSelected ? 14 : isShape ? 0 : 6}
          shadowColor={isSelected ? '#ffffff' : color}
          shadowOpacity={isSelected ? 0.5 : 0.35}
          stroke={isSelected ? '#ffffff' : color}
          strokeWidth={isShape ? (isSelected ? 3 : 2.5) : (isSelected ? 2.5 : 0)}
          hitFunc={isShape ? (ctx, shape) => {
            const r = Math.min(width, height) / 2
            const cx = width / 2
            const cy = height / 2
            const hw = 8
            const innerR = Math.max(0, r - hw)
            ctx.beginPath()
            ctx.arc(cx, cy, r + hw, 0, Math.PI * 2, false)
            ctx.closePath()
            if (innerR > 0) {
              ctx.moveTo(cx + innerR, cy)
              ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true)
              ctx.closePath()
            }
            ctx.fillShape(shape)
          } : undefined}
        />
      ) : (
        <Rect
          width={width}
          height={height}
          fill={isShape ? 'transparent' : color}
          opacity={isShape ? 1 : 0.85}
          cornerRadius={isShape ? 4 : 6}
          shadowBlur={isSelected ? 14 : isShape ? 0 : 6}
          shadowColor={isSelected ? '#ffffff' : color}
          shadowOpacity={isSelected ? 0.5 : 0.35}
          stroke={isSelected ? '#ffffff' : color}
          strokeWidth={isShape ? (isSelected ? 3 : 2.5) : (isSelected ? 2.5 : 0)}
          hitFunc={isShape ? (ctx, shape) => {
            const hw = 8
            const innerW = Math.max(0, width - hw * 2)
            const innerH = Math.max(0, height - hw * 2)
            ctx.beginPath()
            ctx.rect(0, 0, width, height)
            if (innerW > 0 && innerH > 0) {
              // Counterclockwise inner rect creates a hole via nonzero winding rule
              ctx.moveTo(hw, hw)
              ctx.lineTo(hw, hw + innerH)
              ctx.lineTo(hw + innerW, hw + innerH)
              ctx.lineTo(hw + innerW, hw)
              ctx.closePath()
            }
            ctx.fillShape(shape)
          } : undefined}
        />
      )}

      {!isShape && (
        <Text
          x={0}
          y={height / 2 - iconFontSize / 2 - 2}
          width={width}
          text={ITEM_ICONS[item.type]}
          fontSize={iconFontSize}
          align="center"
          listening={false}
        />
      )}

      <Text
        x={-12}
        y={height + 5}
        width={width + 24}
        text={item.label}
        fontSize={11}
        fill={isSelected ? selectedLabelColor : labelColor}
        align="center"
        fontStyle={isSelected ? 'bold' : 'normal'}
        listening={false}
      />
    </Group>
  )
}
