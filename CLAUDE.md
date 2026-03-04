# Stage Plot — Project Context

## What this app is
A cross-platform desktop app (macOS + Windows) for musicians and sound engineers to create **stage plots** for live music events. It works fully **offline** — no internet connection required, no backend, no accounts.

## Tech stack
- **Electron** v33 + **electron-vite** v2.x (requires Vite 5, NOT v6)
- **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS** v3 with CSS custom properties for theming (`data-theme` on `<html>`)
- **react-konva / Konva.js** — all canvas rendering
- **better-sqlite3** — local SQLite database (native module, must be rebuilt for Electron's Node ABI)
- **Zustand** v5 — state management with `persist` middleware for preferences
- **i18next + react-i18next** — EN/ES translations
- **jsPDF** — PDF export

## Project structure
```
src/
  main/         # Electron main process (Node.js): db.ts (SQLite + IPC handlers), index.ts (window)
  preload/      # Context bridge → exposes window.api to renderer
  renderer/src/ # React app (no direct Node access)
    App.tsx
    assets/index.css
    components/
      Toolbar/Toolbar.tsx
      ItemPalette/ItemPalette.tsx
      StageCanvas/
        StageCanvas.tsx       # Canvas, keyboard shortcuts, export, context menu
        StageItemNode.tsx     # Individual item rendering (Konva Group)
    i18n/
      en.ts / es.ts           # Translation strings
      index.ts                # i18next init
    store/
      useProjectStore.ts      # Projects, items, undo/redo
      usePrefsStore.ts        # Theme + language (persisted)
  shared/
    types.ts                  # StageItemType, StageItem, Project, IpcChannels
```

## Key architectural rules
- `src/shared/types.ts` — single source of truth for types shared between main and renderer
- `window.api` (preload) exposes: `platform`, `projects.*`, `items.*` — all async, returns promises
- Never use `export default` in `postcss.config.js` or `tailwind.config.js` — they must use `module.exports` (CommonJS)
- Modals must be rendered **outside** `<header style="WebkitAppRegion:drag">` (use React fragment) — otherwise clicks are intercepted by the drag region
- macOS: `isMac && <div className="w-20">` spacer in toolbar for traffic lights overlap

## UX principles
- **User-friendly above all** — prefer fewer clicks, sensible defaults, discoverable interactions
- **Keyboard shortcuts** matter — power users (sound engineers) will use them heavily
- Items on canvas **keep their stored label** when language changes — only new items get the new language's name
- Undo/redo must always be functional (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- **Hit targets must be generous** — interactive areas (click, drag) should be at least 12px wide; never rely on the visual stroke width alone. For outline-only shapes use `hitFunc` to create a thick invisible ring around the border.
- **Labels are part of the item** — the text label below any canvas item should be included in the hit region so users can click or drag from the name, not just the shape body.
- **Feedback on every interaction** — selections show a visible highlight (white stroke/glow), hover states exist on all buttons, destructive actions are clearly labelled.
- **No surprising side-effects** — clicking inside a transparent shape should pass through to items beneath it; body-dragging a cable disconnects it (intentional); cancelling a dialog must leave state unchanged.
- **Error states are non-blocking** — failed operations (import error, update check failure) show a dismissible message and never crash or freeze the UI.

## StageItemType values
`microphone | monitor | amp | keyboard | drums | di_box | speaker_main | person | generic | rectangle | circle`

**Instrument items** (`microphone`, `monitor`, `amp`, `keyboard`, `drums`, `di_box`, `speaker_main`, `person`, `generic`):
- Filled shape (circle or rect) with semi-transparent color + drop shadow
- Emoji icon centered inside, label text below

**Shape items** (`rectangle`, `circle`):
- Outline-only: transparent fill, colored stroke (no emoji icon)
- Scalable (resize via Transformer) + rotatable
- `circle` uses `keepRatio={true}` on Transformer to stay circular
- **Hollow hit region** via `hitFunc`: clicks on the border (±12px) select the shape, clicks in the transparent interior pass through to items underneath (nonzero winding rule: outer path clockwise + inner path counterclockwise = ring). The label zone below the shape is also included as a hit target.

## State management
- `useProjectStore` — projects, items, `undoStack`, `redoStack` (max 50 entries), `exportFns`
- All item mutations call `pushHistory()` before applying changes
- `nudgeItem(id, dx, dy)` — moves item WITHOUT pushing history (for held arrow key repeats)
- `usePrefsStore` — `theme: 'dark'|'light'`, `language: 'en'|'es'`, persisted to localStorage
- History cleared on `openProject` and `closeProject`

## Canvas / Konva patterns
- `nodeRefs = useRef(new Map<string, Konva.Group>())` — stores Konva refs for Transformer attachment
- `selectedItem` + `isSelectedShape` derived from `selectedId` + `items` (plain variables, not state)
- Transformer: `resizeEnabled={isSelectedShape}`, `keepRatio={selectedItem?.type === 'circle'}`, `rotationSnaps={[0,90,180,270]}`, `rotationSnapTolerance={10}`
- `handleTransformEnd`: for shapes, reads `node.scaleX()/scaleY()`, calculates new width/height, resets scale to 1, saves to store
- `arrowHeldRef` pattern: first keydown pushes history, held repeats call `nudgeItem`, keyup resets the flag
- `CANVAS_COLORS` — theme-aware color palette for background, grid, labels, etc.

## Keyboard shortcuts
| Shortcut | Action |
|---|---|
| Cmd/Ctrl+Z | Undo |
| Cmd/Ctrl+Shift+Z | Redo |
| Delete / Backspace | Delete selected item |
| Escape | Deselect |
| `[` / `]` | Rotate ±15° |
| Shift+`[` / Shift+`]` | Rotate ±45° |
| Arrow keys | Nudge 1px |
| Shift+Arrow | Nudge 10px |

## i18n
- Translation keys in `src/renderer/src/i18n/en.ts` and `es.ts`
- Do NOT add `CustomTypeOptions` augmentation to `i18n/index.ts` — causes TS errors when keys are passed as string variables
- When adding a new palette item: add `tKey` in `en.ts`/`es.ts`, use `t(item.tKey)` as the label passed to `addItem()`

## Known gotchas
- `@electron/rebuild` must be **v3.6.0** (v4 requires Node 22+; project uses Node 20)
- `electron-vite` v2.x requires **Vite `^5`**, not v6
- `better-sqlite3` is a native module — `"postinstall": "electron-rebuild -f -w better-sqlite3"` in package.json rebuilds it automatically after `npm install`
- `window.api.platform` (from preload) is used for macOS detection in the renderer

## Dev workflow
```bash
npm run dev          # Start Electron app in dev mode (hot reload)
npm run build        # Compile TypeScript + bundle (no package)
npm run package:mac  # Build distributable for macOS (.dmg / .app)
npm run package:win  # Build distributable for Windows (.exe) — must run on Windows or CI
npm run typecheck    # Type-check without building
```
