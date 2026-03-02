import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toolbar } from './components/Toolbar/Toolbar'
import { ItemPalette } from './components/ItemPalette/ItemPalette'
import { StageCanvas } from './components/StageCanvas/StageCanvas'
import { useProjectStore } from './store/useProjectStore'

export default function App(): JSX.Element {
  const { t } = useTranslation()
  const { activeProject, undo, redo } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

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

  // Global undo/redo keyboard shortcuts (work even when canvas isn't focused)
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
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <ItemPalette />
        <main ref={containerRef} className="flex-1 overflow-hidden relative">
          {activeProject ? (
            <StageCanvas width={canvasSize.width} height={canvasSize.height} />
          ) : (
            <div className="flex h-full items-center justify-center flex-col gap-3 text-muted select-none">
              <span className="text-5xl opacity-20">🎸</span>
              <p className="text-sm">{t('projects.openOrCreate')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
