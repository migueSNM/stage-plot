import { useEffect } from 'react'
import type React from 'react'
import { useProjectStore } from '../store/useProjectStore'
import type { StageItem } from '../../../shared/types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

interface KeyboardShortcutsConfig {
  editingIdRef: React.RefObject<string | null>
  selectedIdsRef: React.MutableRefObject<string[]>
  spaceDownRef: React.MutableRefObject<boolean>
  isPanningRef: React.MutableRefObject<boolean>
  arrowHeldRef: React.MutableRefObject<boolean>
  deleteItems: (ids: string[]) => void
  updateItem: (item: StageItem) => void
  nudgeItem: (id: string, dx: number, dy: number) => void
  nudgeItems: (ids: string[], dx: number, dy: number) => void
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  setBackgroundSelected: React.Dispatch<React.SetStateAction<boolean>>
  closeContextMenu: () => void
  closeColorPicker: () => void
  setPanCursor: React.Dispatch<React.SetStateAction<'none' | 'grab' | 'grabbing'>>
}

export function useKeyboardShortcuts({
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
  closeContextMenu,
  closeColorPicker,
  setPanCursor
}: KeyboardShortcutsConfig): void {
  useEffect(() => {
    const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === ' ' && !e.repeat && !editingIdRef.current) {
        e.preventDefault()
        spaceDownRef.current = true
        setPanCursor('grab')
        return
      }

      if (editingIdRef.current) return
      const ids = selectedIdsRef.current
      const mod = e.metaKey || e.ctrlKey

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
        closeContextMenu()
        closeColorPicker()
        return
      }

      if ((e.key === '[' || e.key === ']') && ids.length === 1) {
        e.preventDefault()
        const item = useProjectStore.getState().items.find((i) => i.id === ids[0])
        if (!item) return
        const step = e.shiftKey ? 45 : 15
        const dir = e.key === '[' ? -1 : 1
        updateItem({ ...item, rotation: ((item.rotation ?? 0) + dir * step + 360) % 360 })
        return
      }

      if (ARROW_KEYS.includes(e.key) && ids.length > 0) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0

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
  }, [
    editingIdRef, selectedIdsRef, spaceDownRef, isPanningRef, arrowHeldRef,
    deleteItems, updateItem, nudgeItem, nudgeItems,
    setSelectedIds, setBackgroundSelected, closeContextMenu, closeColorPicker, setPanCursor
  ])
}
