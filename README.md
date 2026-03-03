# Stage Plot

Desktop app for musicians and sound engineers to create stage plots for live music events. Works fully offline — no internet, no accounts, no backend.

**Built with:** Electron · React 18 · TypeScript · Konva.js · SQLite · Tailwind CSS

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How to Make Changes](#how-to-make-changes)
- [Building & Distributing](#building--distributing)
- [Releases & Git Workflow](#releases--git-workflow)

---

## Getting Started

```bash
# Install dependencies (also rebuilds native SQLite module for Electron)
npm install

# Start in development mode (hot reload)
npm run dev
```

> **Node 20 required.** The native SQLite dependency (`better-sqlite3`) must be compiled against Electron's Node ABI. The `postinstall` script handles this automatically.

---

## Project Structure

```
stage-plot/
├── src/
│   ├── main/                        # Electron main process (Node.js)
│   │   ├── index.ts                 # Window creation, app lifecycle
│   │   └── db.ts                    # SQLite database + all IPC handlers
│   │
│   ├── preload/
│   │   └── index.ts                 # Bridge: exposes window.api to the renderer
│   │
│   ├── renderer/src/                # React app (standard web code)
│   │   ├── App.tsx                  # Root layout, global keyboard shortcuts
│   │   ├── assets/index.css         # Tailwind + CSS variables for dark/light theme
│   │   ├── main.tsx                 # React entry point
│   │   │
│   │   ├── components/
│   │   │   ├── Toolbar/
│   │   │   │   └── Toolbar.tsx      # Top bar: projects, undo/redo, export, theme, language
│   │   │   ├── ItemPalette/
│   │   │   │   └── ItemPalette.tsx  # Left sidebar with draggable items + search
│   │   │   └── StageCanvas/
│   │   │       ├── StageCanvas.tsx  # Main canvas: interactions, keyboard, context menu, export
│   │   │       └── StageItemNode.tsx # Individual item rendering (Konva shapes)
│   │   │
│   │   ├── i18n/
│   │   │   ├── en.ts               # English strings
│   │   │   ├── es.ts               # Spanish strings
│   │   │   └── index.ts            # i18next initialization
│   │   │
│   │   └── store/
│   │       ├── useProjectStore.ts  # Projects, items, undo/redo history
│   │       └── usePrefsStore.ts    # Theme + language (persisted to localStorage)
│   │
│   └── shared/
│       └── types.ts                # Shared types: StageItem, Project, IpcChannels
│
├── resources/                      # App icons (add icon.png / icon.ico here)
├── electron-builder.yml            # Packaging configuration
├── electron.vite.config.ts         # Build configuration
├── tailwind.config.js
└── CLAUDE.md                       # AI assistant context (for Claude Code)
```

### How the three parts communicate

```
Main process (Node.js / SQLite)
    ↕  IPC (inter-process communication)
Preload (window.api bridge)
    ↕  window.api.*
Renderer (React app)
```

The renderer never accesses the filesystem directly. It calls `window.api.projects.list()` → preload forwards it via IPC → main process queries SQLite → result returned as a Promise.

---

## How to Make Changes

### Add a new palette item (e.g. "Piano")

1. **[src/shared/types.ts](src/shared/types.ts)** — add `'piano'` to `StageItemType`

2. **[src/renderer/src/i18n/en.ts](src/renderer/src/i18n/en.ts)** — add to `palette`:
   ```ts
   piano: 'Piano',
   ```

3. **[src/renderer/src/i18n/es.ts](src/renderer/src/i18n/es.ts)** — add translated version:
   ```ts
   piano: 'Piano',
   ```

4. **[src/renderer/src/components/ItemPalette/ItemPalette.tsx](src/renderer/src/components/ItemPalette/ItemPalette.tsx)** — add to `PALETTE_ITEMS` and `DEFAULT_SIZES`:
   ```ts
   { type: 'piano', tKey: 'palette.piano', icon: '🎹' }
   piano: { w: 120, h: 40 }
   ```

5. **[src/renderer/src/components/StageCanvas/StageItemNode.tsx](src/renderer/src/components/StageCanvas/StageItemNode.tsx)** — add a color and icon:
   ```ts
   ITEM_COLORS: { ..., piano: '#c084fc' }
   ITEM_ICONS:  { ..., piano: '🎹' }
   ```

---

### Add a new translation string

1. Add the key to [en.ts](src/renderer/src/i18n/en.ts) and [es.ts](src/renderer/src/i18n/es.ts)
2. Use in any component:
   ```tsx
   const { t } = useTranslation()
   <span>{t('your.key')}</span>
   ```

> **Do not** add `CustomTypeOptions` to `i18n/index.ts` — it causes TypeScript errors when translation keys are passed as variables.

---

### Change colors / theme

- **App UI colors** — [src/renderer/src/assets/index.css](src/renderer/src/assets/index.css): edit the CSS variables under `:root` (dark) and `[data-theme='light']`
- **Canvas colors** — [src/renderer/src/components/StageCanvas/StageCanvas.tsx](src/renderer/src/components/StageCanvas/StageCanvas.tsx): edit the `CANVAS_COLORS` object

---

### Add a keyboard shortcut

- **Canvas shortcuts** (rotate, delete, nudge) — `onKeyDown` in [StageCanvas.tsx](src/renderer/src/components/StageCanvas/StageCanvas.tsx)
- **Global shortcuts** (undo/redo) — [App.tsx](src/renderer/src/App.tsx)

---

### Change the database schema

Edit [src/main/db.ts](src/main/db.ts). Add a migration in the `runMigrations()` function:

```ts
db.exec(`ALTER TABLE stage_items ADD COLUMN my_field TEXT`)
```

Migrations run on every app startup and are safe to re-run (use `IF NOT EXISTS` / `ALTER TABLE` patterns).

---

### Add a new backend operation (IPC)

1. **[src/shared/types.ts](src/shared/types.ts)** — add to `IpcChannels`:
   ```ts
   'db:items:myAction': { args: [id: string]; return: void }
   ```

2. **[src/main/db.ts](src/main/db.ts)** — add the handler:
   ```ts
   ipcMain.handle('db:items:myAction', (_, id) => { ... })
   ```

3. **[src/preload/index.ts](src/preload/index.ts)** — expose it:
   ```ts
   myAction: (id) => ipcRenderer.invoke('db:items:myAction', id)
   ```

4. Call from the renderer: `window.api.items.myAction(id)`

---

## Building & Distributing

### Executables

After running a build, distributables are placed in `dist/`:

| File | Platform | For |
|------|----------|-----|
| `dist/stage-plot-x.x.x-arm64.dmg` | macOS | Apple Silicon (M1/M2/M3/M4) |
| `dist/stage-plot-x.x.x-x64.dmg` | macOS | Intel Macs |
| `dist/stage-plot-x.x.x-setup.exe` | Windows | x64 PCs |
| `dist/mac-arm64/Stage Plot.app` | macOS | Raw app bundle (arm64) |
| `dist/mac/Stage Plot.app` | macOS | Raw app bundle (x64) |

### Build commands

```bash
# macOS (both Intel and Apple Silicon DMGs) — run from a Mac
npm run package:mac

# Windows installer — run from a Windows machine (or use GitHub Actions)
npm run package:win

# Both platforms via GitHub Actions (recommended — no setup needed)
# See "Releases & Git Workflow" below
```

> **Windows from Mac**: You cannot build the Windows `.exe` from a Mac. Use the GitHub Actions workflow instead — it runs on a real Windows machine in the cloud.

### Installing on macOS (for the recipient)

1. Open the `.dmg` file
2. Drag **Stage Plot** to the Applications folder
3. First launch: right-click the app → **Open** → confirm (needed because the app is unsigned)

### Installing on Windows (for the recipient)

1. Run `stage-plot-x.x.x-setup.exe`
2. Windows SmartScreen may warn about an unknown publisher — click **More info → Run anyway**

---

## Releases & Git Workflow

### Day-to-day development

```bash
# Check what's changed
git status
git diff

# Stage and commit your changes
git add src/                         # or specific files
git commit -m "feat: describe what you did"

# Push to GitHub
git push
```

### Creating a release (triggers macOS + Windows builds automatically)

```bash
# 1. Make sure everything is committed and pushed
git status
git push

# 2. Create a version tag (use semantic versioning: major.minor.patch)
git tag v0.2.0

# 3. Push the tag — this triggers the GitHub Actions build workflow
git push --tags
```

After ~10 minutes, go to your repo on GitHub → **Actions** tab to download the built installers as artifacts.

### Bumping the version number

Edit `"version"` in [package.json](package.json) before tagging:

```json
{
  "version": "0.2.0"
}
```

### Useful git commands

```bash
# See commit history
git log --oneline

# See all tags
git tag

# Delete a tag (if you made a mistake, before pushing)
git tag -d v0.2.0

# Delete a remote tag (after pushing — use carefully)
git push origin --delete v0.2.0

# See what changed between versions
git diff v0.1.0 v0.2.0

# Undo last commit (keeps your changes, just un-commits)
git reset --soft HEAD~1
```

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Delete` / `Backspace` | Delete selected item |
| `Escape` | Deselect |
| `[` / `]` | Rotate ±15° |
| `Shift + [` / `Shift + ]` | Rotate ±45° |
| Arrow keys | Nudge item 1px |
| `Shift + Arrow` | Nudge item 10px |
| Double-click item | Rename |
| Right-click item | Context menu |
