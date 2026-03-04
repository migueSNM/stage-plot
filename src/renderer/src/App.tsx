import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toolbar } from './components/Toolbar/Toolbar'
import { ItemPalette } from './components/ItemPalette/ItemPalette'
import { StageCanvas } from './components/StageCanvas/StageCanvas'
import { useProjectStore } from './store/useProjectStore'

const REPO = 'miguesnm/stage-plot-releases'
const RELEASES_URL = `https://github.com/${REPO}/releases/latest`
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`

function parseVersion(tag: string): number[] {
  return tag.replace(/^v/, '').split('.').map(Number)
}

function isNewer(latestTag: string, current: string): boolean {
  const l = parseVersion(latestTag)
  const c = parseVersion(current)
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false
  }
  return false
}

type UpdateStatus = 'checking' | 'uptodate' | 'error' | null

export default function App(): JSX.Element {
  const { t } = useTranslation()
  const { activeProject, undo, redo } = useProjectStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [updateInfo, setUpdateInfo] = useState<{ version: string; url: string } | null>(null)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('checking')

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

  // Update check — runs in the renderer using Chromium fetch (no IPC hop for the network call)
  useEffect(() => {
    async function check(): Promise<void> {
      try {
        const currentVersion = await window.api.app.getVersion()
        const res = await fetch(API_URL, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        })
        if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`)
        const data: { tag_name: string } = await res.json()
        if (isNewer(data.tag_name, currentVersion)) {
          setUpdateInfo({ version: data.tag_name.replace(/^v/, ''), url: RELEASES_URL })
          setUpdateStatus(null)
        } else {
          setUpdateStatus('uptodate')
          setTimeout(() => setUpdateStatus(null), 3000)
        }
      } catch {
        setUpdateStatus('error')
        setTimeout(() => setUpdateStatus(null), 5000)
      }
    }
    check()
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

      {/* Update status bar */}
      {updateStatus === 'checking' && (
        <div className="flex items-center justify-center gap-2 py-1 border-b border-border/40
                        text-[11px] text-muted/50 flex-shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-muted/40 animate-pulse" />
          {t('updates.checking')}
        </div>
      )}
      {updateStatus === 'uptodate' && (
        <div className="flex items-center justify-center gap-1.5 py-1 border-b border-green-900/30
                        bg-green-950/20 text-[11px] text-green-500/70 flex-shrink-0 select-none">
          ✓ {t('updates.upToDate')}
        </div>
      )}
      {updateStatus === 'error' && (
        <div className="flex items-center justify-center gap-1.5 py-1 border-b border-border/40
                        text-[11px] text-muted/40 flex-shrink-0 select-none">
          {t('updates.error')}
        </div>
      )}

      {/* Update available banner */}
      {updateInfo && (
        <div className="flex items-center justify-between gap-3 px-4 py-2
                        bg-accent/15 border-b border-accent/30 text-sm flex-shrink-0">
          <span className="text-white/80">
            🎉 {t('updates.available', { version: updateInfo.version })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.api.app.openReleasePage(updateInfo.url)}
              className="px-3 py-1 rounded bg-accent text-white text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer"
            >
              {t('updates.download')}
            </button>
            <button
              onClick={() => setUpdateInfo(null)}
              className="text-white/50 hover:text-white/80 transition-colors
                         text-xs cursor-pointer px-1"
            >
              {t('updates.dismiss')}
            </button>
          </div>
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
