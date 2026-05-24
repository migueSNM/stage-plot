import type { StageItem, CableExtra, TextExtra, CustomExtra, BaseExtra, ItemExtra } from './types'

export const CABLE_TYPES = new Set([
  'cable_xlr',
  'cable_trs',
  'cable_ts',
  'cable_midi',
  'cable_speakon'
])

export function isCableType(type: string): boolean {
  return CABLE_TYPES.has(type)
}

export function getCableExtra(item: StageItem): (CableExtra & BaseExtra) | null {
  if (!isCableType(item.type) || !item.extra) return null
  return item.extra as CableExtra & BaseExtra
}

export function getTextExtra(item: StageItem): TextExtra & BaseExtra {
  const ex = item.extra as (TextExtra & BaseExtra) | null
  return {
    fontSize: ex?.fontSize ?? 16,
    fontStyle: ex?.fontStyle ?? 'normal',
    layerLocked: ex?.layerLocked
  }
}

export function getCustomExtra(item: StageItem): (CustomExtra & BaseExtra) | null {
  if (item.type !== 'custom' || !item.extra) return null
  return item.extra as CustomExtra & BaseExtra
}

export function isLayerLocked(item: StageItem): boolean {
  if (!item.extra) return false
  return !!(item.extra as BaseExtra).layerLocked
}

export function setLayerLocked(item: StageItem, locked: boolean): ItemExtra {
  return { ...(item.extra ?? {}), layerLocked: locked } as ItemExtra
}
