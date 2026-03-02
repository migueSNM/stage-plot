import { useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore'

export function Toolbar(): JSX.Element {
  const { projects, activeProject, loadProjects, openProject, createProject, closeProject } =
    useProjectStore()
  const [showProjects, setShowProjects] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleOpen(): Promise<void> {
    await loadProjects()
    setShowProjects(true)
  }

  async function handleCreate(): Promise<void> {
    if (!newName.trim()) return
    const project = await createProject(newName.trim())
    await openProject(project.id)
    setNewName('')
    setShowProjects(false)
  }

  return (
    <header className="h-12 flex items-center px-4 gap-3 bg-surface border-b border-border flex-shrink-0 select-none"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <span className="font-bold text-accent tracking-tight mr-2">Stage Plot</span>

      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleOpen}
          className="text-xs px-3 py-1.5 rounded bg-surface-2 hover:bg-border transition-colors"
        >
          Open
        </button>

        {activeProject && (
          <button
            onClick={closeProject}
            className="text-xs px-3 py-1.5 rounded hover:bg-surface-2 transition-colors text-muted"
          >
            Close
          </button>
        )}
      </div>

      {activeProject && (
        <span className="text-sm font-medium ml-2">{activeProject.name}</span>
      )}

      {/* Project picker modal */}
      {showProjects && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={(e) => e.target === e.currentTarget && setShowProjects(false)}
        >
          <div className="bg-surface rounded-xl p-6 w-96 shadow-2xl border border-border">
            <h2 className="text-lg font-bold mb-4">Projects</h2>

            {/* Create new */}
            <div className="flex gap-2 mb-4">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="New project name…"
                className="flex-1 bg-surface-2 rounded px-3 py-2 text-sm outline-none
                           border border-border focus:border-accent"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded bg-accent text-white text-sm font-medium
                           disabled:opacity-40"
              >
                Create
              </button>
            </div>

            {/* Existing projects */}
            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {projects.length === 0 && (
                <p className="text-muted text-sm text-center py-4">No projects yet</p>
              )}
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={async () => {
                    await openProject(p.id)
                    setShowProjects(false)
                  }}
                  className="text-left px-3 py-2 rounded hover:bg-surface-2 text-sm transition-colors"
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
    </header>
  )
}
