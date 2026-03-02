import { useEffect, useRef, useState } from 'react'
import { Toolbar } from './components/Toolbar/Toolbar'
import { ItemPalette } from './components/ItemPalette/ItemPalette'
import { StageCanvas } from './components/StageCanvas/StageCanvas'
import { useProjectStore } from './store/useProjectStore'

export default function App(): JSX.Element {
  const { activeProject } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setCanvasSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <ItemPalette />
        <main ref={containerRef} className="flex-1 overflow-hidden relative">
          {activeProject ? (
            <StageCanvas width={canvasSize.width} height={canvasSize.height} />
          ) : (
            <div className="flex h-full items-center justify-center flex-col gap-3 text-muted select-none">
              <span className="text-5xl opacity-20">🎸</span>
              <p className="text-sm">Open or create a project to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
