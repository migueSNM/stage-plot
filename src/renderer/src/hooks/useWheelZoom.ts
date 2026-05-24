import type React from 'react'
import type Konva from 'konva'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

interface UseWheelZoomConfig {
  stageRef: React.RefObject<Konva.Stage | null>
  canvasScale: number
  canvasPos: { x: number; y: number }
  setCanvasScale: (s: number) => void
  setCanvasPos: (pos: { x: number; y: number }) => void
}

export function useWheelZoom({
  stageRef,
  canvasScale,
  canvasPos,
  setCanvasScale,
  setCanvasPos
}: UseWheelZoomConfig): (e: Konva.KonvaEventObject<WheelEvent>) => void {
  return function handleWheelZoom(e: Konva.KonvaEventObject<WheelEvent>): void {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const scaleBy = 1.08
    const oldScale = canvasScale
    const dir = e.evt.deltaY < 0 ? 1 : -1
    const newScale = clamp(dir > 0 ? oldScale * scaleBy : oldScale / scaleBy, 0.2, 4.0)
    const ptr = stage.getPointerPosition()
    if (!ptr) return
    const mousePointTo = {
      x: (ptr.x - canvasPos.x) / oldScale,
      y: (ptr.y - canvasPos.y) / oldScale
    }
    setCanvasScale(newScale)
    setCanvasPos({
      x: ptr.x - mousePointTo.x * newScale,
      y: ptr.y - mousePointTo.y * newScale
    })
  }
}
