import { useEffect, useRef, useState } from 'react'
import { ItemPalette } from './components/ItemPalette/ItemPalette'
import { StageCanvas } from './components/StageCanvas/StageCanvas'
import { DemoToolbar } from './DemoToolbar'
import { useProjectStore } from './store/useProjectStore'
import { DEMO_PROJECT, DEMO_ITEMS } from './demoData'

export default function DemoApp(): JSX.Element {
  const { undo, redo } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Load demo project into the store on mount (bypasses DB/IPC entirely)
  useEffect(() => {
    useProjectStore.setState({
      activeProject: DEMO_PROJECT,
      items: DEMO_ITEMS,
      undoStack: [],
      redoStack: []
    })
  }, [])

  // Observe canvas container size
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

  // Global undo/redo shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const mod = e.metaKey || e.ctrlKey
      if (mod && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useProjectStore.getState().undo()
      }
      if ((mod && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        useProjectStore.getState().redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return (
    <div className="flex flex-col h-full">
      <DemoToolbar />

      {/* Demo banner */}
      <div className="flex items-center justify-center gap-3 px-4 py-1.5
                      bg-accent/10 border-b border-accent/20 flex-shrink-0 select-none">
        <span className="text-[11px] text-white/60">
          ✨ Live demo — drag items onto the canvas, zoom, right-click for options, and try all features
        </span>
        <a
          href="https://github.com/migueSNM/stage-plot/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] px-2.5 py-0.5 rounded bg-accent/30 text-accent/90
                     hover:bg-accent/50 transition-colors whitespace-nowrap"
        >
          Download the app ↗
        </a>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ItemPalette />
        <main ref={containerRef} className="flex-1 overflow-hidden relative">
          <StageCanvas width={canvasSize.width} height={canvasSize.height} />
        </main>
      </div>
    </div>
  )
}
