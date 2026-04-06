import { useState } from 'react'
import { Group, Rect, Circle, Text, Path, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import type { StageItem, StageItemType } from '../../../../shared/types'
import { ICON_BODIES } from '../../assets/icons/iconPaths'
import { getInstrumentImage } from '../../assets/instruments/index'

export const LABEL_HEIGHT = 22

// Emoji fallbacks for types not covered by ICON_BODIES (custom items only)
export const ITEM_ICONS: Record<StageItemType, string> = {
  // People
  person: '🎤',
  // Guitars & Basses
  guitar_acoustic: '🎸',
  guitar_electric: '🎸',
  guitar_classical: '🎸',
  bass_electric: '🎸',
  bass_upright: '🎻',
  guitar: '🎸',
  bass: '🎸',
  // Amplifiers
  amp_combo: '🔊',
  amp_head: '🔊',
  amp_cab: '🔊',
  amp_bass: '🔊',
  amp: '🔊',
  // Keyboards & Piano
  piano_grand: '🎹',
  piano_baby_grand: '🎹',
  piano_upright: '🎹',
  keyboard: '🎹',
  organ: '🎹',
  // Drums & Percussion
  drums: '🥁',
  drums_electronic: '🥁',
  drums_kick: '🥁',
  drums_snare: '🥁',
  drums_hihat: '🥁',
  drums_cymbal: '🥁',
  cajon: '🪘',
  congas: '🪘',
  marimba: '🎼',
  timpani: '🥁',
  percussion: '🪘',
  // Horns & Winds
  wind_trumpet: '🎺',
  wind_saxophone: '🎷',
  wind_flute: '🪈',
  wind_trombone: '🎺',
  // Microphones
  microphone: '🎙',
  mic_stand: '🎙',
  mic_overhead: '🎙',
  // PA & Monitors
  speaker_main: '📯',
  subwoofer: '🔊',
  monitor: '📢',
  monitor_sidefill: '📢',
  monitor_iem: '🎧',
  di_box: '📦',
  // Stage
  platform: '⬛',
  desk_foh: '🎛',
  // Legacy / misc
  generic: '⬜',
  rectangle: '',
  circle: '',
  // Cables & Annotations
  cable_xlr: '',
  cable_trs: '',
  cable_ts: '',
  cable_midi: '',
  cable_speakon: '',
  text: '',
  custom: ''
}

// Types that are resizable (like shapes) but with opaque fill
export const RESIZABLE_TYPES = new Set<StageItemType>(['rectangle', 'circle', 'text', 'platform'])

// Lock icon path (padlock closed) — rendered as badge on locked items
const LOCK_PATH = 'M5 11V7a4 4 0 0 1 8 0v4M3 11h12v8H3zM9 15v2'

interface StageItemNodeProps {
  item: StageItem
  isSelected: boolean
  labelColor: string
  selectedLabelColor: string
  nodeRef: (node: Konva.Group | null) => void
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragStart: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
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
  onDragStart,
  onDragMove,
  onDragEnd,
  onContextMenu,
  onDblClick
}: StageItemNodeProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false)
  const color = item.color
  const { width, height } = item
  const isShape = item.type === 'rectangle' || item.type === 'circle'
  const isPlatform = item.type === 'platform'
  const isCircular = item.type === 'circle'
  const isCustom = item.type === 'custom'
  const isLayerLocked = !!(item.extra as Record<string, unknown> | null)?.layerLocked
  const showHover = isHovered && !isSelected

  // Platform gets a distinct fill style (muted stage-surface look)
  const platformFill = color ?? 'rgba(60,60,90,0.6)'

  // Shapes always show their border (they ARE the border); instruments only on hover/select
  const effectiveStroke = isSelected
    ? '#ffffff'
    : showHover
      ? 'rgba(255,255,255,0.55)'
      : isShape
        ? (color ?? '#888888')
        : 'transparent'

  // SVG body silhouette path for this item type (if available)
  // ICON_PATHS is exported for palette use only (ItemPalette.tsx)
  const bodyData = ICON_BODIES[item.type]

  // For custom items the emoji is stored in extra.emoji
  const customEmoji = isCustom ? ((item.extra?.emoji as string) ?? '⭐') : undefined

  // Scale the 24×24 icon path to ~82 % of the item's smaller dimension (was 0.65)
  const iconSize = Math.min(width, height) * 0.82
  const iconScale = iconSize / 24
  const iconOffsetX = (width - 24 * iconScale) / 2
  const iconOffsetY = (height / 2) - (24 * iconScale) / 2 - 2

  // Font size for emoji fallback (custom items)
  const iconFontSize = Math.min(width, height) * 0.45

  // Lock badge dimensions
  const badgeSize = Math.max(12, Math.min(width, height) * 0.28)
  const badgeScale = badgeSize / 16

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isCircular ? (
        <Circle
          x={width / 2}
          y={height / 2}
          radius={Math.min(width, height) / 2}
          fill='transparent'
          opacity={1}
          shadowBlur={0}
          shadowColor='transparent'
          stroke={effectiveStroke}
          strokeWidth={isShape ? (isSelected ? 3 : 2.5) : isSelected ? 2.5 : showHover ? 1.5 : 0}
          hitFunc={
            isShape
              ? (ctx, shape) => {
                  const r = Math.min(width, height) / 2
                  const cx = width / 2
                  const cy = height / 2
                  const hw = 12
                  const innerR = Math.max(0, r - hw)
                  ctx.beginPath()
                  ctx.arc(cx, cy, r + hw, 0, Math.PI * 2, false)
                  ctx.closePath()
                  if (innerR > 0) {
                    ctx.moveTo(cx + innerR, cy)
                    ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true)
                    ctx.closePath()
                  }
                  ctx.rect(-12, height + 4, width + 24, LABEL_HEIGHT)
                  ctx.fillShape(shape)
                }
              : undefined
          }
        />
      ) : isPlatform ? (
        // Platform: solid fill with grid lines to indicate raised surface
        <>
          <Rect
            width={width}
            height={height}
            fill={platformFill}
            opacity={isSelected ? 0.9 : showHover ? 0.8 : 0.65}
            cornerRadius={3}
            shadowBlur={isSelected ? 16 : showHover ? 8 : 4}
            shadowColor={isSelected ? '#ffffff' : '#000000'}
            shadowOpacity={isSelected ? 0.4 : showHover ? 0.3 : 0.2}
            stroke={isSelected ? '#ffffff' : showHover ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={isSelected ? 2 : 1.5}
          />
          {/* Subtle grid lines to suggest platform surface */}
          {width > 40 && height > 30 && (
            <>
              <Rect x={width * 0.33} y={2} width={1} height={height - 4} fill="rgba(255,255,255,0.1)" listening={false} />
              <Rect x={width * 0.66} y={2} width={1} height={height - 4} fill="rgba(255,255,255,0.1)" listening={false} />
              <Rect x={2} y={height * 0.5} width={width - 4} height={1} fill="rgba(255,255,255,0.1)" listening={false} />
            </>
          )}
        </>
      ) : (
        <Rect
          width={width}
          height={height}
          fill='transparent'
          opacity={1}
          cornerRadius={isShape ? 4 : 6}
          shadowBlur={0}
          shadowColor='transparent'
          stroke={effectiveStroke}
          strokeWidth={isShape ? (isSelected ? 3 : 2.5) : isSelected ? 2.5 : showHover ? 1.5 : 0}
          hitFunc={
            isShape
              ? (ctx, shape) => {
                  const hw = 12
                  const innerW = Math.max(0, width - hw * 2)
                  const innerH = Math.max(0, height - hw * 2)
                  ctx.beginPath()
                  ctx.rect(0, 0, width, height)
                  if (innerW > 0 && innerH > 0) {
                    ctx.moveTo(hw, hw)
                    ctx.lineTo(hw, hw + innerH)
                    ctx.lineTo(hw + innerW, hw + innerH)
                    ctx.lineTo(hw + innerW, hw)
                    ctx.closePath()
                  }
                  ctx.rect(-12, height + 4, width + 24, LABEL_HEIGHT)
                  ctx.fillShape(shape)
                }
              : undefined
          }
        />
      )}

      {/* Instrument icon: SVG image (preferred) or path fallback */}
      {/* Flipped 180° via scaleY=-1 so the instrument faces the front of stage (bottom) */}
      {!isShape && !isPlatform && !isCustom && (() => {
        const img = getInstrumentImage(item.type)
        if (img) {
          // Use the preloaded SVG image
          const imgSize = Math.min(width, height) * 0.82
          const imgX = (width - imgSize) / 2
          const imgY = height / 2 - imgSize / 2 - 2
          return (
            <KonvaImage
              image={img}
              x={imgX}
              y={imgY + imgSize}   // offset because scaleY=-1 flips from bottom edge
              width={imgSize}
              height={imgSize}
              scaleY={-1}
              opacity={isSelected ? 1 : showHover ? 0.95 : 0.88}
              listening={false}
              shadowBlur={isSelected ? 18 : showHover ? 12 : color ? 10 : 0}
              shadowColor={isSelected ? '#ffffff' : showHover ? '#ffffff' : (color ?? '#ffffff')}
              shadowOpacity={isSelected ? 0.75 : showHover ? 0.5 : color ? 0.55 : 0}
            />
          )
        }
        // Fallback: path-based white silhouette
        if (!bodyData) return null
        return (
          <Path
            x={iconOffsetX + 24 * iconScale}
            y={iconOffsetY + 24 * iconScale}
            data={bodyData}
            scaleX={-iconScale}
            scaleY={-iconScale}
            fill="rgba(255,255,255,0.92)"
            opacity={isSelected ? 1 : showHover ? 0.95 : 0.88}
            listening={false}
            shadowBlur={isSelected ? 18 : showHover ? 12 : color ? 10 : 0}
            shadowColor={isSelected ? '#ffffff' : showHover ? '#ffffff' : (color ?? '#ffffff')}
            shadowOpacity={isSelected ? 0.75 : showHover ? 0.5 : color ? 0.55 : 0}
          />
        )
      })()}

      {/* Custom items: emoji text */}
      {!isShape && !isPlatform && isCustom && (
        <Text
          x={0}
          y={height / 2 - iconFontSize / 2 - 2}
          width={width}
          text={customEmoji}
          fontSize={iconFontSize}
          align="center"
          listening={false}
        />
      )}

      {/* Label */}
      <Text
        x={-12}
        y={isPlatform ? height + 3 : height + 5}
        width={width + 24}
        text={item.label}
        fontSize={11}
        fill={isSelected ? selectedLabelColor : labelColor}
        align="center"
        fontStyle={isSelected ? 'bold' : 'normal'}
        listening={false}
      />

      {/* Layer lock badge — shown in top-right corner when locked */}
      {isLayerLocked && (
        <Group x={width - badgeSize - 2} y={2} listening={false}>
          <Rect
            width={badgeSize}
            height={badgeSize}
            fill="rgba(0,0,0,0.55)"
            cornerRadius={3}
          />
          <Path
            x={(badgeSize - 16 * badgeScale) / 2}
            y={(badgeSize - 16 * badgeScale) / 2 - 1}
            data={LOCK_PATH}
            scaleX={badgeScale}
            scaleY={badgeScale}
            fill="none"
            stroke="rgba(255,220,50,0.9)"
            strokeWidth={2.5 / badgeScale}
            strokeScaleEnabled={false}
            lineCap="round"
            lineJoin="round"
          />
        </Group>
      )}
    </Group>
  )
}
