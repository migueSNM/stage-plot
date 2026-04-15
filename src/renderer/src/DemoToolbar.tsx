import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from './store/useProjectStore'
import { usePrefsStore } from './store/usePrefsStore'
import type { StagePlotExportData } from '../../shared/types'
import { DEMO_PROJECT } from './demoData'

const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? ''

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function DemoToolbar(): JSX.Element {
  const { t } = useTranslation()
  const { language, setLanguage } = usePrefsStore()
  const {
    items, exportFns, undoStack, redoStack, undo, redo,
    canvasScale, setCanvasScale, setCanvasPos,
    backgroundImage, backgroundLocked, setBackgroundImage, setBackgroundLocked,
    importProject
  } = useProjectStore()

  const [showExport, setShowExport] = useState(false)
  const [importError, setImportError]   = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const canUndo = undoStack.length > 0
  const canRedo = redoStack.length > 0

  useEffect(() => {
    if (!showExport) return
    function dismiss(e: MouseEvent): void {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExport(false)
      }
    }
    window.addEventListener('mousedown', dismiss)
    return () => window.removeEventListener('mousedown', dismiss)
  }, [showExport])

  async function handleExportJson(): Promise<void> {
    const data: StagePlotExportData = { version: 1, project: DEMO_PROJECT, items }
    await window.api.files.exportJson(data)
    setShowExport(false)
  }

  async function handleImportBackground(): Promise<void> {
    setShowExport(false)
    const dataUrl = await window.api.files.importImage()
    if (dataUrl) await setBackgroundImage(dataUrl)
  }

  async function handleImportJson(): Promise<void> {
    setShowExport(false)
    setImportError(null)
    setImportSuccess(null)
    const data = await window.api.files.importJson()
    if (!data) {
      setImportError(t('fileOps.importError'))
      return
    }
    try {
      const project = await importProject(data)
      setImportSuccess(t('fileOps.importSuccess', { name: project.name }))
      setTimeout(() => setImportSuccess(null), 4000)
    } catch {
      setImportError(t('fileOps.importError'))
    }
  }

  return (
    <>
      <header className="h-12 flex items-center gap-2 bg-surface border-b border-border flex-shrink-0 select-none">
        <span className="font-bold text-accent tracking-tight px-3">Stage Plot</span>

        {/* Demo badge */}
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent/80 border border-accent/30">
          DEMO
        </span>

        <div className="flex items-center gap-1 flex-1">
          {/* Undo / Redo */}
          <button onClick={undo} disabled={!canUndo}
            title={`${t('toolbar.undo')} (Ctrl+Z)`}
            className="text-base w-7 h-7 flex items-center justify-center rounded
                       hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors cursor-pointer">
            ↩
          </button>
          <button onClick={redo} disabled={!canRedo}
            title={`${t('toolbar.redo')} (Ctrl+⇧+Z)`}
            className="text-base w-7 h-7 flex items-center justify-center rounded
                       hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors cursor-pointer">
            ↪
          </button>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Zoom */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => setCanvasScale(clamp(canvasScale / 1.15, 0.2, 4))}
              title={t('toolbar.zoomOut')}
              className="text-sm w-7 h-7 flex items-center justify-center rounded hover:bg-surface-2 transition-colors cursor-pointer">
              −
            </button>
            <span className="w-12 text-center text-xs text-muted tabular-nums">
              {Math.round(canvasScale * 100)}%
            </span>
            <button onClick={() => setCanvasScale(clamp(canvasScale * 1.15, 0.2, 4))}
              title={t('toolbar.zoomIn')}
              className="text-sm w-7 h-7 flex items-center justify-center rounded hover:bg-surface-2 transition-colors cursor-pointer">
              +
            </button>
            <button onClick={() => { setCanvasScale(1); setCanvasPos({ x: 0, y: 0 }) }}
              title={t('toolbar.resetZoom')}
              className="text-xs w-7 h-7 flex items-center justify-center rounded hover:bg-surface-2 transition-colors cursor-pointer text-muted">
              ↺
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Export / Import */}
          <div ref={exportMenuRef} className="relative">
            <button onClick={() => setShowExport((v) => !v)}
              className="text-xs px-3 py-1.5 rounded bg-surface-2 hover:bg-border
                         transition-colors cursor-pointer flex items-center gap-1">
              {t('toolbar.export')} <span className="opacity-50 text-[10px]">▾</span>
            </button>
            {showExport && (
              <div className="absolute top-full left-0 mt-1 bg-surface border border-border
                              rounded-lg shadow-2xl py-1 min-w-40 z-50 overflow-hidden">
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2"
                  onClick={handleImportJson}>
                  📂 {t('toolbar.importJson')}
                </button>
                <div className="h-px bg-border mx-2 my-1" />
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2 disabled:opacity-40"
                  onClick={handleImportBackground}
                  disabled={backgroundLocked}>
                  🖼 {t('toolbar.importBg')}
                </button>
                {backgroundImage && (
                  <>
                    <button className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2"
                      onClick={() => { void setBackgroundLocked(!backgroundLocked); setShowExport(false) }}>
                      {backgroundLocked ? '🔓' : '🔒'} {t(backgroundLocked ? 'toolbar.unlockBg' : 'toolbar.lockBg')}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2 disabled:opacity-40"
                      onClick={() => { void setBackgroundImage(null); setShowExport(false) }}
                      disabled={backgroundLocked}>
                      ✕ {t('toolbar.removeBg')}
                    </button>
                  </>
                )}
                <div className="h-px bg-border mx-2 my-1" />
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2"
                  onClick={() => { exportFns.png?.(); setShowExport(false) }}>
                  🖼 {t('toolbar.exportPng')}
                </button>
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2"
                  onClick={() => { exportFns.pdf?.(); setShowExport(false) }}>
                  📄 {t('toolbar.exportPdf')}
                </button>
                <button className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2 transition-colors flex items-center gap-2"
                  onClick={handleExportJson}>
                  💾 {t('toolbar.exportJson')}
                </button>
              </div>
            )}
          </div>

          <span className="text-sm font-medium text-white/60 ml-2 truncate max-w-48">
            {DEMO_PROJECT.name}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 pr-3">
          {APP_VERSION && (
            <span className="text-[10px] font-mono text-muted/50 pr-1">v{APP_VERSION}</span>
          )}
          <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            title={t('toolbar.language')}
            className="text-xs px-2.5 py-1.5 rounded hover:bg-surface-2 transition-colors
                       cursor-pointer font-mono text-muted hover:text-white">
            {language.toUpperCase()}
          </button>
        </div>
      </header>

      {importError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg
                        bg-red-900/90 border border-red-700 text-red-200 text-xs shadow-xl flex items-center gap-2">
          <span>⚠</span> {importError}
          <button onClick={() => setImportError(null)} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}
      {importSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg
                        bg-green-900/90 border border-green-700 text-green-200 text-xs shadow-xl flex items-center gap-2">
          <span>✓</span> {importSuccess}
        </div>
      )}
    </>
  )
}
