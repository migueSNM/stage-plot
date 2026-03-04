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
│   │   │       ├── StageCanvas.tsx        # Main canvas: interactions, keyboard, context menu, export
│   │   │       ├── StageItemNode.tsx      # Individual item rendering (Konva shapes)
│   │   │       ├── CableNode.tsx          # Cable rendering + orthogonal routing algorithm
│   │   │       ├── TextNode.tsx           # Text annotation rendering
│   │   │       └── ColorPickerPopover.tsx # Per-item color picker popover
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

### Work with cables

Cables are a special item type (`cable_xlr`, `cable_trs`, `cable_ts`, `cable_midi`, `cable_speakon`). They render as colored orthogonal lines and can be snapped to the ports on any other item.

**Adding a cable:** drag it from the palette. It starts as a free-floating line with both endpoints unconnected.

**Connecting endpoints:** select the cable, then drag one of the two circular handles to any item. When you get within ~40 px of a port (top / right / bottom / left centre), a blue ring snaps the endpoint. Release to commit the connection. The cable will re-route automatically when the connected item moves.

**Routing logic** (`CableNode.tsx` → `getRoutedPoints`)

All cables use strictly orthogonal (90°) routing with a short stub that exits perpendicular to the connected port face before any turn. The routing strategy:

- **0 turns** — endpoints already aligned on the same axis.
- **1 turn (L-shape)** — normal case; one horizontal leg + one vertical leg.
- **2 turns** — backtracking along one axis (e.g. left port → bottom port). The stub on the exit side provides a safe X-coordinate to pivot on, avoiding overlap with either item.
- **3 turns** — backtracking on both axes (e.g. left port → right port). Both stub endpoints may sit at item-centre coordinates so neither is a safe corner. The cable routes below (or around) both items using a `safeY = max(p1.y, p2.y) + 60px` bypass row.

The core rule: a stub coordinate is "safe" only along the axis it travels (horizontal stub → safe X, vertical stub → safe Y). Before using a stub coordinate as a routing corner, the algorithm checks whether it lies outside the connected item's boundary.

**Body drag:** dragging the cable line itself disconnects both endpoints and moves the whole cable freely.

---

### Add a keyboard shortcut

- **Canvas shortcuts** (rotate, delete, nudge, zoom, pan) — `onKeyDown` in [StageCanvas.tsx](src/renderer/src/components/StageCanvas/StageCanvas.tsx)
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

### Downloading a release

Pre-built installers are attached to every release on GitHub:

**https://github.com/migueSNM/stage-plot/releases**

| File | Platform |
|------|----------|
| `Stage Plot-x.x.x.dmg` | macOS — universal (Apple Silicon + Intel, one file) |
| `Stage Plot Setup x.x.x.exe` | Windows x64 |

### Build commands

```bash
# macOS universal DMG (arm64 + x86_64) — run from a Mac
npm run package:mac

# Windows installer — run from a Windows machine (or use GitHub Actions)
npm run package:win

# Both platforms via GitHub Actions (recommended — no setup needed)
# See "Releases & Git Workflow" below
```

> **Windows from Mac**: You cannot build the Windows `.exe` from a Mac. Use the GitHub Actions workflow instead — it runs on a real Windows machine in the cloud.

### Installing on macOS

1. Open the `.dmg` file
2. Drag **Stage Plot** into the Applications folder
3. Try to open it — macOS will block it with a Gatekeeper warning because the app is not yet notarized

**To open it anyway (one-time step):**

- **macOS Ventura / Sonoma / Sequoia:** Go to **System Settings → Privacy & Security**, scroll down to the "Security" section, and click **"Open Anyway"** next to the Stage Plot message. Then open the app normally.
- **macOS Monterey and earlier:** Go to **System Preferences → Security & Privacy → General** and click **"Open Anyway"**.

> This prompt only appears once. After approving it, the app opens normally every time.

### Installing on Windows

1. Run `Stage Plot Setup x.x.x.exe`
2. If Windows SmartScreen shows an "Unknown publisher" warning, click **More info → Run anyway**

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

Do these steps **in order** every time you want to publish a new version:

```bash
# 1. Make sure all your changes are committed and pushed
git status          # should be clean
git push

# 2. Bump the version number in package.json  ← must come BEFORE the tag
#    Edit "version" manually, e.g. "0.1.0" → "0.2.0"
#    Use semantic versioning: major.minor.patch

# 3. Commit the version bump
git add package.json
git commit -m "chore: bump version to 0.2.0"
git push

# 4. Create a tag that matches the version (must start with "v")
git tag v0.2.0

# 5. Push the tag — this is what triggers the GitHub Actions build
git push origin v0.2.0
```

After ~10 minutes, go to your repo on GitHub → **Actions** tab to download the built installers as artifacts.

> **Order matters:** the version in `package.json` must be updated and committed _before_ you create the tag, so the version number is baked into the packaged app correctly.

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
| `Cmd/Ctrl + C` | Copy selected items |
| `Cmd/Ctrl + V` | Paste (offset +20 px) |
| `Delete` / `Backspace` | Delete selected item(s) |
| `Escape` | Deselect / close menu |
| `[` / `]` | Rotate ±15° (single selection) |
| `Shift + [` / `Shift + ]` | Rotate ±45° (single selection) |
| Arrow keys | Nudge item(s) 1px |
| `Shift + Arrow` | Nudge item(s) 10px |
| `Cmd/Ctrl + =` / `+` | Zoom in |
| `Cmd/Ctrl + -` | Zoom out |
| `Cmd/Ctrl + 0` | Reset zoom & position |
| `Space + drag` | Pan canvas (on empty background) |
| Middle mouse drag | Pan canvas (anywhere) |
| Mouse wheel | Zoom toward cursor |
| `Shift + click` | Add / remove item from selection |
| Drag on empty canvas | Marquee (rubber-band) selection |
| Double-click item | Rename / edit text |
| Right-click item | Context menu |
