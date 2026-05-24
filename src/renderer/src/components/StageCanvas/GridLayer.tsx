import { Layer, Rect, Text } from 'react-konva'

export const GRID_SIZE = 40

export const CANVAS_COLORS = {
  bg: '#f0f2fa',
  grid: '#d4d8ee',
  stageBorder: '#9090bb',
  stageText: '#a0a0cc',
  label: '#3a3a5a',
  labelSelected: '#1a1a2e'
}

interface GridLayerProps {
  width: number
  height: number
  colors: typeof CANVAS_COLORS
  frontOfStageLabel: string
}

export function GridLayer({ width, height, colors, frontOfStageLabel }: GridLayerProps): JSX.Element {
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

  return (
    <Layer listening={false}>
      <Rect x={0} y={0} width={width} height={height} fill={colors.bg} />
      {lines}
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
        text={frontOfStageLabel}
        fontSize={11}
        fill={colors.stageText}
        fontStyle="bold"
        letterSpacing={2}
      />
    </Layer>
  )
}
