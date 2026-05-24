import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { app, IpcMain } from 'electron'
import { join } from 'path'
import type { Project, StageItem } from '../shared/types'

let db: Database.Database

function getDb(): Database.Database {
  if (!db) {
    const dbPath = join(app.getPath('userData'), 'stage-plot.db')
    try {
      db = new Database(dbPath)
      db.pragma('journal_mode = WAL')
      migrate(db)
    } catch (err) {
      console.error('[stage-plot] Failed to open database:', err)
      throw err
    }
  }
  return db
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stage_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      rotation REAL NOT NULL DEFAULT 0,
      width REAL NOT NULL,
      height REAL NOT NULL,
      color TEXT,
      extra TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS project_backgrounds (
      project_id TEXT PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
      image_data TEXT,
      locked INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Safe additive migrations for existing tables
  try { db.exec('ALTER TABLE project_backgrounds ADD COLUMN x REAL') } catch {}
  try { db.exec('ALTER TABLE project_backgrounds ADD COLUMN y REAL') } catch {}
  try { db.exec('ALTER TABLE project_backgrounds ADD COLUMN width REAL') } catch {}
  try { db.exec('ALTER TABLE project_backgrounds ADD COLUMN height REAL') } catch {}
  try { db.exec('ALTER TABLE projects ADD COLUMN patch_map TEXT') } catch {}

  // v1: switch background storage from base64 in DB to files on disk.
  // Clear all existing data so legacy base64 entries don't linger.
  const version = (db.pragma('user_version', { simple: true }) as number) ?? 0
  if (version < 1) {
    db.exec('DELETE FROM stage_items; DELETE FROM project_backgrounds; DELETE FROM projects;')
    db.pragma('user_version = 1')
  }
}

// ─── Background file helpers ──────────────────────────────────────────────────

function getBgDir(): string {
  return path.join(app.getPath('userData'), 'stage-plot-backgrounds')
}

function extFromMime(dataUrl: string): string {
  const mime = dataUrl.slice(5, dataUrl.indexOf(';'))
  if (mime === 'image/jpeg') return 'jpg'
  return 'png'
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')
}

function bufferToDataUrl(buf: Buffer, ext: string): string {
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png'
  return `data:${mime};base64,${buf.toString('base64')}`
}

function writeBackgroundFile(projectId: string, dataUrl: string): string {
  const ext = extFromMime(dataUrl)
  const dir = getBgDir()
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${projectId}.${ext}`), dataUrlToBuffer(dataUrl))
  return `stage-plot-backgrounds/${projectId}.${ext}`
}

function deleteBackgroundFile(projectId: string): void {
  const dir = getBgDir()
  for (const ext of ['png', 'jpg', 'jpeg']) {
    const filePath = path.join(dir, `${projectId}.${ext}`)
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch { /* ignore */ }
    }
  }
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

export function registerDbHandlers(ipcMain: IpcMain): void {
  // Projects
  ipcMain.handle('db:projects:list', () => {
    type DbProject = Project & { patch_map: string | null }
    const rows = getDb().prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as DbProject[]
    return rows.map((r) => ({ ...r, patch_map: r.patch_map ? JSON.parse(r.patch_map) : null })) as Project[]
  })

  ipcMain.handle('db:projects:get', (_e, id: string) => {
    type DbProject = Project & { patch_map: string | null }
    const row = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as DbProject | undefined
    if (!row) return undefined
    return { ...row, patch_map: row.patch_map ? JSON.parse(row.patch_map) : null } as Project
  })

  ipcMain.handle('db:projects:save', (_e, project: Project) => {
    const patchMapJson = project.patch_map ? JSON.stringify(project.patch_map) : null
    getDb()
      .prepare(
        `INSERT INTO projects (id, name, description, patch_map, created_at, updated_at)
         VALUES (@id, @name, @description, @patch_map, @created_at, @updated_at)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           description = excluded.description,
           patch_map = excluded.patch_map,
           updated_at = excluded.updated_at`
      )
      .run({ ...project, patch_map: patchMapJson })
    return project
  })

  ipcMain.handle('db:projects:delete', (_e, id: string) => {
    deleteBackgroundFile(id)
    getDb().prepare('DELETE FROM projects WHERE id = ?').run(id)
  })

  // Stage items
  ipcMain.handle('db:items:list', (_e, projectId: string) => {
    const rows = getDb()
      .prepare('SELECT * FROM stage_items WHERE project_id = ? ORDER BY sort_order')
      .all(projectId) as (StageItem & { extra: string | null })[]
    return rows.map((r) => ({ ...r, extra: r.extra ? JSON.parse(r.extra) : null })) as StageItem[]
  })

  ipcMain.handle('db:items:save', (_e, item: StageItem) => {
    getDb()
      .prepare(
        `INSERT INTO stage_items (id, project_id, type, label, x, y, rotation, width, height, color, extra, sort_order)
         VALUES (@id, @project_id, @type, @label, @x, @y, @rotation, @width, @height, @color, @extra, @sort_order)
         ON CONFLICT(id) DO UPDATE SET
           label = excluded.label,
           x = excluded.x,
           y = excluded.y,
           rotation = excluded.rotation,
           width = excluded.width,
           height = excluded.height,
           color = excluded.color,
           extra = excluded.extra,
           sort_order = excluded.sort_order`
      )
      .run({ ...item, extra: item.extra ? JSON.stringify(item.extra) : null })
    return item
  })

  ipcMain.handle('db:items:saveMany', (_e, items: StageItem[]) => {
    const insert = getDb().prepare(
      `INSERT INTO stage_items (id, project_id, type, label, x, y, rotation, width, height, color, extra, sort_order)
       VALUES (@id, @project_id, @type, @label, @x, @y, @rotation, @width, @height, @color, @extra, @sort_order)
       ON CONFLICT(id) DO UPDATE SET
         label = excluded.label,
         x = excluded.x,
         y = excluded.y,
         rotation = excluded.rotation,
         width = excluded.width,
         height = excluded.height,
         color = excluded.color,
         extra = excluded.extra,
         sort_order = excluded.sort_order`
    )
    const saveAll = getDb().transaction((items: StageItem[]) => {
      for (const item of items) {
        insert.run({ ...item, extra: item.extra ? JSON.stringify(item.extra) : null })
      }
    })
    saveAll(items)
  })

  ipcMain.handle('db:items:delete', (_e, id: string) => {
    getDb().prepare('DELETE FROM stage_items WHERE id = ?').run(id)
  })

  ipcMain.handle('db:items:deleteByProject', (_e, projectId: string) => {
    getDb().prepare('DELETE FROM stage_items WHERE project_id = ?').run(projectId)
  })

  // Background image
  ipcMain.handle('db:background:get', (_e, projectId: string) => {
    const row = getDb()
      .prepare('SELECT image_data, locked, x, y, width, height FROM project_backgrounds WHERE project_id = ?')
      .get(projectId) as {
        image_data: string | null
        locked: number
        x: number | null
        y: number | null
        width: number | null
        height: number | null
      } | undefined

    const meta = {
      locked: !!row?.locked,
      x: row?.x ?? null,
      y: row?.y ?? null,
      width: row?.width ?? null,
      height: row?.height ?? null
    }

    if (!row || !row.image_data) return { imageData: null, ...meta }

    // Legacy base64 stored before file-based migration — discard silently
    if (row.image_data.startsWith('data:')) return { imageData: null, ...meta }

    // Normal path: read file from disk
    try {
      const fullPath = path.join(app.getPath('userData'), row.image_data)
      const buf = fs.readFileSync(fullPath)
      const ext = path.extname(row.image_data).slice(1)
      return { imageData: bufferToDataUrl(buf, ext), ...meta }
    } catch {
      // File missing — clean up the stale DB entry
      getDb()
        .prepare('UPDATE project_backgrounds SET image_data = NULL WHERE project_id = ?')
        .run(projectId)
      return { imageData: null, ...meta }
    }
  })

  ipcMain.handle(
    'db:background:set',
    (_e, projectId: string, imageData: string | null, locked: boolean, x: number | null, y: number | null, width: number | null, height: number | null) => {
      let storedValue: string | null
      if (imageData === null) {
        deleteBackgroundFile(projectId)
        storedValue = null
      } else if (imageData.startsWith('data:')) {
        storedValue = writeBackgroundFile(projectId, imageData)
      } else {
        storedValue = imageData  // already a stored path (idempotent re-save)
      }
      getDb()
        .prepare(
          `INSERT INTO project_backgrounds (project_id, image_data, locked, x, y, width, height)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(project_id) DO UPDATE SET
             image_data = excluded.image_data,
             locked = excluded.locked,
             x = excluded.x,
             y = excluded.y,
             width = excluded.width,
             height = excluded.height`
        )
        .run(projectId, storedValue, locked ? 1 : 0, x, y, width, height)
    }
  )
}
