import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toolbar } from './components/Toolbar/Toolbar'
import { ItemPalette } from './components/ItemPalette/ItemPalette'
import { StageCanvas } from './components/StageCanvas/StageCanvas'
import { useProjectStore } from './store/useProjectStore'
import { preloadInstrumentImages } from './assets/instruments/index'

type UpdateStatus = 'downloading' | 'ready' | 'error' | null

export default function App(): JSX.Element {
  const { t } = useTranslation()
  const { activeProject, undo, redo } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(null)

  // Preload all instrument SVG images on mount
  useEffect(() => { preloadInstrumentImages() }, [])

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

  // Listen for update events sent by electron-updater in the main process
  useEffect(() => {
    window.api.app.onUpdateAvailable((version) => {
      setUpdateVersion(version)
      setUpdateStatus('downloading')
    })
    window.api.app.onUpdateDownloaded(() => {
      setUpdateStatus('ready')
    })
    window.api.app.onUpdateError(() => {
      setUpdateStatus('error')
    })
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

      {/* Update banner */}
      {updateStatus === 'downloading' && (
        <div className="flex items-center justify-center gap-2 py-1 border-b border-border/40
                        text-[11px] text-muted/50 flex-shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" />
          {t('updates.downloading', { version: updateVersion })}
        </div>
      )}
      {updateStatus === 'ready' && (
        <div className="flex items-center justify-between gap-3 px-4 py-1.5
                        bg-accent/15 border-b border-accent/30 flex-shrink-0">
          <span className="text-[11px] text-white/80">{t('updates.ready')}</span>
          <button
            onClick={() => window.api.app.installUpdate()}
            className="px-3 py-0.5 rounded bg-accent text-white text-xs font-medium
                       hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('updates.restart')}
          </button>
        </div>
      )}
      {updateStatus === 'error' && (
        <div className="flex items-center justify-between gap-3 px-4 py-1.5
                        border-b border-border/40 flex-shrink-0">
          <span className="text-[11px] text-muted/60">{t('updates.installError')}</span>
          <button
            onClick={() => { window.api.app.openReleases(); setUpdateStatus(null) }}
            className="px-3 py-0.5 rounded bg-white/10 text-white/70 text-xs
                       hover:bg-white/15 transition-colors cursor-pointer"
          >
            {t('updates.downloadManually')}
          </button>
        </div>
      )}

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
