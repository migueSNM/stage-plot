import { Group, Rect, Circle, Text } from 'react-konva'
import type Konva from 'konva'
import type { StageItem, StageItemType } from '../../../../shared/types'

const ITEM_COLORS: Record<StageItemType, string> = {
  microphone: '#e94560',
  monitor: '#f5a623',
  amp: '#7ed321',
  keyboard: '#4a90e2',
  drums: '#9b59b6',
  di_box: '#1abc9c',
  speaker_main: '#e67e22',
  person: '#3498db',
  generic: '#95a5a6'
}

const ITEM_LABELS: Record<StageItemType, string> = {
  microphone: 'MIC',
  monitor: 'MON',
  amp: 'AMP',
  keyboard: 'KEYS',
  drums: 'DRUMS',
  di_box: 'DI',
  speaker_main: 'MAIN',
  person: 'PERF',
  generic: 'ITEM'
}

interface StageItemNodeProps {
  item: StageItem
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
}

export function StageItemNode({ item, onDragEnd }: StageItemNodeProps): JSX.Element {
  const color = item.color ?? ITEM_COLORS[item.type]
  const { width, height } = item

  const isCircular = item.type === 'microphone' || item.type === 'person'

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable
      onDragEnd={onDragEnd}
    >
      {isCircular ? (
        <Circle
          x={width / 2}
          y={height / 2}
          radius={Math.min(width, height) / 2}
          fill={color}
          opacity={0.85}
          shadowBlur={6}
          shadowColor={color}
          shadowOpacity={0.4}
        />
      ) : (
        <Rect
          width={width}
          height={height}
          fill={color}
          opacity={0.85}
          cornerRadius={4}
          shadowBlur={6}
          shadowColor={color}
          shadowOpacity={0.4}
        />
      )}
      <Text
        x={0}
        y={height / 2 - 6}
        width={width}
        text={item.label || ITEM_LABELS[item.type]}
        fontSize={11}
        fill="#ffffff"
        align="center"
        fontStyle="bold"
      />
    </Group>
  )
}
