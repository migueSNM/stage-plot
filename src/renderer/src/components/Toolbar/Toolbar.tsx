import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import { usePrefsStore } from '../../store/usePrefsStore'
import type { StagePlotExportData } from '../../../../shared/types'

const isMac = window.api.platform === 'darwin'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function Toolbar(): JSX.Element {
  const { t } = useTranslation()
  const { theme, language, setTheme, setLanguage } = usePrefsStore()
  const {
    projects,
    activeProject,
    items,
    loadProjects,
    openProject,
    createProject,
    closeProject,
    importProject,
    exportFns,
    undoStack,
    redoStack,
    undo,
    redo,
    canvasScale,
    setCanvasScale,
    setCanvasPos
  } = useProjectStore()

  const [showProjects, setShowProjects] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [newName, setNewName] = useState('')
  const [dbError, setDbError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

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

  async function handleOpen(): Promise<void> {
    try {
      await loadProjects()
      setDbError(null)
    } catch (err) {
      setDbError(err instanceof Error ? err.message : String(err))
    }
    setShowProjects(true)
  }

  async function handleCreate(): Promise<void> {
    if (!newName.trim()) return
    const project = await createProject(newName.trim())
    await openProject(project.id)
    setNewName('')
    setShowProjects(false)
  }

  async function handleExportJson(): Promise<void> {
    if (!activeProject) return
    const data: StagePlotExportData = { version: 1, project: activeProject, items }
    await window.api.files.exportJson(data)
    setShowExport(false)
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

  const canUndo = undoStack.length > 0
  const canRedo = redoStack.length > 0

  return (
    <>
      <header
        className="h-12 flex items-center gap-2 bg-surface border-b border-border flex-shrink-0 select-none"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {isMac && <div className="w-20 flex-shrink-0" />}

        <span className="font-bold text-accent tracking-tight px-2">Stage Plot</span>

        {/* Left controls */}
        <div
          className="flex items-center gap-1 flex-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleOpen}
            className="text-xs px-3 py-1.5 rounded bg-surface-2 hover:bg-border transition-colors cursor-pointer"
          >
            {t('toolbar.projects')}
          </button>

          {activeProject && (
            <>
              <button
                onClick={closeProject}
                className="text-xs px-2 py-1.5 rounded hover:bg-surface-2 transition-colors text-muted cursor-pointer"
              >
                {t('toolbar.close')}
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Undo / Redo */}
              <button
                onClick={undo}
                disabled={!canUndo}
                title={`${t('toolbar.undo')} (${isMac ? '⌘' : 'Ctrl'}+Z)`}
                className="text-base w-7 h-7 flex items-center justify-center rounded
                           hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors cursor-pointer"
              >
                ↩
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title={`${t('toolbar.redo')} (${isMac ? '⌘' : 'Ctrl'}+⇧+Z)`}
                className="text-base w-7 h-7 flex items-center justify-center rounded
                           hover:bg-surface-2 disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors cursor-pointer"
              >
                ↪
              </button>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Zoom controls */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setCanvasScale(clamp(canvasScale / 1.15, 0.2, 4))}
                  title={t('toolbar.zoomOut')}
                  className="text-sm w-7 h-7 flex items-center justify-center rounded
                             hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  −
                </button>
                <span className="w-12 text-center text-xs text-muted tabular-nums">
                  {Math.round(canvasScale * 100)}%
                </span>
                <button
                  onClick={() => setCanvasScale(clamp(canvasScale * 1.15, 0.2, 4))}
                  title={t('toolbar.zoomIn')}
                  className="text-sm w-7 h-7 flex items-center justify-center rounded
                             hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setCanvasScale(1)
                    setCanvasPos({ x: 0, y: 0 })
                  }}
                  title={t('toolbar.resetZoom')}
                  className="text-xs w-7 h-7 flex items-center justify-center rounded
                             hover:bg-surface-2 transition-colors cursor-pointer text-muted"
                >
                  ↺
                </button>
              </div>

              <div className="w-px h-5 bg-border mx-1" />

              {/* Export / Import */}
              <div ref={exportMenuRef} className="relative">
                <button
                  onClick={() => setShowExport((v) => !v)}
                  className="text-xs px-3 py-1.5 rounded bg-surface-2 hover:bg-border
                             transition-colors cursor-pointer flex items-center gap-1"
                >
                  {t('toolbar.export')} <span className="opacity-50 text-[10px]">▾</span>
                </button>
                {showExport && (
                  <div className="absolute top-full left-0 mt-1 bg-surface border border-border
                                  rounded-lg shadow-2xl py-1 min-w-40 z-50 overflow-hidden">
                    <button
                      className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2
                                 transition-colors flex items-center gap-2"
                      onClick={handleImportJson}
                    >
                      📂 {t('toolbar.importJson')}
                    </button>
                    <div className="h-px bg-border mx-2 my-1" />
                    <button
                      className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2
                                 transition-colors flex items-center gap-2"
                      onClick={() => {
                        exportFns.png?.()
                        setShowExport(false)
                      }}
                    >
                      🖼 {t('toolbar.exportPng')}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2
                                 transition-colors flex items-center gap-2"
                      onClick={() => {
                        exportFns.pdf?.()
                        setShowExport(false)
                      }}
                    >
                      📄 {t('toolbar.exportPdf')}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-xs hover:bg-surface-2
                                 transition-colors flex items-center gap-2"
                      onClick={handleExportJson}
                    >
                      💾 {t('toolbar.exportJson')}
                    </button>
                  </div>
                )}
              </div>

              <span className="text-sm font-medium text-white/60 ml-2 truncate max-w-48">
                {activeProject.name}
              </span>
            </>
          )}
        </div>

        {/* Right-side: language + theme */}
        <div
          className="flex items-center gap-1 pr-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            title={t('toolbar.language')}
            className="text-xs px-2.5 py-1.5 rounded hover:bg-surface-2 transition-colors
                       cursor-pointer font-mono text-muted hover:text-white"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={t('toolbar.theme')}
            className="text-sm w-8 h-8 flex items-center justify-center rounded
                       hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Import feedback toasts */}
      {importError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg
                        bg-red-900/90 border border-red-700 text-red-200 text-xs shadow-xl
                        flex items-center gap-2">
          <span>⚠</span> {importError}
          <button onClick={() => setImportError(null)} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}
      {importSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg
                        bg-green-900/90 border border-green-700 text-green-200 text-xs shadow-xl
                        flex items-center gap-2">
          <span>✓</span> {importSuccess}
        </div>
      )}

      {/* Projects modal */}
      {showProjects && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => e.target === e.currentTarget && setShowProjects(false)}
        >
          <div className="bg-surface rounded-xl p-6 w-96 shadow-2xl border border-border">
            <h2 className="text-lg font-bold mb-4">{t('projects.title')}</h2>

            {dbError && (
              <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300 text-xs font-mono break-all">
                {dbError}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder={t('projects.newPlaceholder')}
                className="flex-1 bg-surface-2 rounded px-3 py-2 text-sm outline-none
                           border border-border focus:border-accent"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded bg-accent text-white text-sm font-medium
                           disabled:opacity-40 cursor-pointer"
              >
                {t('projects.create')}
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {projects.length === 0 && (
                <p className="text-muted text-sm text-center py-4">{t('projects.noProjects')}</p>
              )}
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={async () => {
                    await openProject(p.id)
                    setShowProjects(false)
                  }}
                  className="text-left px-3 py-2 rounded hover:bg-surface-2 text-sm
                             transition-colors cursor-pointer"
                >
                  <span className="font-medium">{p.name}</span>
                  {p.description && (
                    <span className="ml-2 text-muted text-xs">{p.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
