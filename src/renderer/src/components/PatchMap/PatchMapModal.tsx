import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StageItem, BaseExtra } from '../../../../shared/types'
import { isPatchableType, getPatchExtra, setPatchExtra } from '../../../../shared/itemExtras'
import { useProjectStore } from '../../store/useProjectStore'

interface PatchEdit {
  patchNumber?: number
  inputLabel?: string
  patchNotes?: string
}

interface Props {
  items: StageItem[]
  projectName: string
  showPatchNumbers: boolean
  focusItemId?: string | null
  onToggleShowPatchNumbers: () => void
  onExportPdf: () => void
  onClose: () => void
}

function sortPatchItems(items: StageItem[]): StageItem[] {
  return [...items].filter((i) => isPatchableType(i.type)).sort((a, b) => {
    const pA = (a.extra as BaseExtra | null)?.patchNumber ?? Infinity
    const pB = (b.extra as BaseExtra | null)?.patchNumber ?? Infinity
    if (pA !== pB) return pA - pB
    return a.sort_order - b.sort_order
  })
}

export function PatchMapModal({
  items,
  projectName,
  showPatchNumbers,
  focusItemId,
  onToggleShowPatchNumbers,
  onExportPdf,
  onClose
}: Props): JSX.Element {
  const { t } = useTranslation()
  const [edits, setEdits] = useState<Record<string, PatchEdit>>({})
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map())
  const channelInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  const patchItems = sortPatchItems(items)
  const isDirty = Object.keys(edits).length > 0

  // Scroll the focused item row into view and focus its channel input
  useEffect(() => {
    if (!focusItemId) return
    const timer = setTimeout(() => {
      rowRefs.current.get(focusItemId)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      channelInputRefs.current.get(focusItemId)?.focus()
    }, 80)
    return () => clearTimeout(timer)
  }, [focusItemId])

  function handleChange(id: string, field: keyof PatchEdit, value: number | string | undefined): void {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
    if (errors.size > 0) setErrors(new Set())
  }

  function validate(): boolean {
    const seen = new Map<number, string[]>()
    for (const item of patchItems) {
      const edit = edits[item.id]
      const num = edit?.patchNumber ?? (item.extra as BaseExtra | null)?.patchNumber
      if (num === undefined) continue
      if (!seen.has(num)) seen.set(num, [])
      seen.get(num)!.push(item.id)
    }
    const dupeIds = new Set<string>()
    for (const ids of seen.values()) {
      if (ids.length > 1) ids.forEach((id) => dupeIds.add(id))
    }
    setErrors(dupeIds)
    return dupeIds.size === 0
  }

  async function handleSave(): Promise<void> {
    validate()
    const changed: StageItem[] = []
    for (const [id, edit] of Object.entries(edits)) {
      const item = items.find((i) => i.id === id)
      if (!item) continue
      changed.push({ ...item, extra: setPatchExtra(item, edit) })
    }
    if (changed.length === 0) { onClose(); return }

    const store = useProjectStore.getState()
    store.pushHistory()
    await window.api.items.saveMany(changed)
    useProjectStore.setState((s) => ({
      items: s.items.map((i) => {
        const updated = changed.find((c) => c.id === i.id)
        return updated ?? i
      })
    }))
    onClose()
  }

  function handleAutoNumber(): void {
    const unassigned = patchItems.filter((item) => {
      const existing = edits[item.id]?.patchNumber ?? (item.extra as BaseExtra | null)?.patchNumber
      return existing === undefined
    })
    if (unassigned.length === 0) return

    const usedNumbers = new Set(
      patchItems.map((item) => edits[item.id]?.patchNumber ?? (item.extra as BaseExtra | null)?.patchNumber).filter((n): n is number => n !== undefined)
    )

    let next = 1
    const newEdits: Record<string, PatchEdit> = { ...edits }
    for (const item of [...unassigned].sort((a, b) => a.sort_order - b.sort_order)) {
      while (usedNumbers.has(next)) next++
      newEdits[item.id] = { ...newEdits[item.id], patchNumber: next }
      usedNumbers.add(next)
      next++
    }
    setEdits(newEdits)
    setErrors(new Set())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-xl border border-border shadow-2xl flex flex-col w-[820px] max-w-[95vw] max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0">
          <span className="text-sm font-bold">{t('patchMap.title')}</span>
          <span className="text-muted text-xs">{projectName}</span>
          <div className="flex-1" />
          <label className="flex items-center gap-1.5 text-xs cursor-pointer text-muted hover:text-text transition-colors select-none">
            <input
              type="checkbox"
              checked={showPatchNumbers}
              onChange={onToggleShowPatchNumbers}
              className="accent-accent"
            />
            {t('patchMap.showOnCanvas')}
          </label>
          <button
            onClick={handleAutoNumber}
            className="text-xs px-3 py-1.5 rounded bg-surface-2 hover:bg-border transition-colors cursor-pointer"
          >
            {t('patchMap.autoNumber')}
          </button>
          <button
            onClick={onExportPdf}
            className="text-xs px-3 py-1.5 rounded bg-surface-2 hover:bg-border transition-colors cursor-pointer"
          >
            {t('patchMap.exportPdf')}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-2 text-muted hover:text-text transition-colors cursor-pointer text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Duplicate warning */}
        {errors.size > 0 && (
          <div className="px-5 py-2 bg-red-500/10 border-b border-red-500/30 text-red-500 text-xs flex items-center gap-2 flex-shrink-0">
            <span>⚠</span>
            <span>{t('patchMap.duplicateWarning')}</span>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {patchItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted text-sm">
              {t('patchMap.empty')}
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-surface z-10">
                <tr className="border-b border-border">
                  <th className="w-16 px-3 py-2 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {t('patchMap.colChannel')}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {t('patchMap.colItem')}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {t('patchMap.colInputLabel')}
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                    {t('patchMap.colNotes')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {patchItems.map((item) => (
                  <PatchRow
                    key={item.id}
                    item={item}
                    edit={edits[item.id]}
                    hasDuplicate={errors.has(item.id)}
                    isFocused={item.id === focusItemId}
                    rowRef={(el) => {
                      if (el) rowRefs.current.set(item.id, el)
                      else rowRefs.current.delete(item.id)
                    }}
                    channelInputRef={(el) => {
                      if (el) channelInputRefs.current.set(item.id, el)
                      else channelInputRefs.current.delete(item.id)
                    }}
                    onChange={handleChange}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="text-xs px-4 py-1.5 rounded bg-surface-2 hover:bg-border transition-colors cursor-pointer"
          >
            {t('patchMap.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="text-xs px-4 py-1.5 rounded bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('patchMap.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

interface PatchRowProps {
  item: StageItem
  edit: PatchEdit | undefined
  hasDuplicate: boolean
  isFocused: boolean
  rowRef: (el: HTMLTableRowElement | null) => void
  channelInputRef: (el: HTMLInputElement | null) => void
  onChange: (id: string, field: keyof PatchEdit, value: number | string | undefined) => void
}

function PatchRow({ item, edit, hasDuplicate, rowRef, channelInputRef, onChange }: PatchRowProps): JSX.Element {
  const { t } = useTranslation()
  const patch = getPatchExtra(item)
  const channelVal = edit?.patchNumber ?? patch.patchNumber ?? ''
  const labelVal = edit?.inputLabel !== undefined ? edit.inputLabel : (patch.inputLabel ?? '')
  const notesVal = edit?.patchNotes !== undefined ? edit.patchNotes : (patch.patchNotes ?? '')

  return (
    <tr
      ref={rowRef}
      className={`border-b border-border/50 transition-colors ${hasDuplicate ? 'bg-red-500/10' : 'hover:bg-surface-2'}`}
    >
      {/* Channel # */}
      <td className="px-3 py-1.5">
        <input
          ref={channelInputRef}
          type="number"
          min={1}
          value={channelVal}
          onChange={(e) => {
            const raw = e.target.value
            onChange(item.id, 'patchNumber', raw === '' ? undefined : Math.max(1, parseInt(raw, 10)))
          }}
          onKeyDown={(e) => e.key === 'Tab' && e.stopPropagation()}
          placeholder="—"
          className={`w-14 bg-surface-2 border rounded px-2 py-1 text-xs text-center outline-none focus:border-accent transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${hasDuplicate ? 'border-red-500' : 'border-border'}`}
        />
      </td>
      {/* Item label (read-only) */}
      <td className="px-3 py-1.5 text-xs text-muted">{item.label}</td>
      {/* Custom input label */}
      <td className="px-3 py-1.5">
        <input
          type="text"
          value={labelVal}
          onChange={(e) => onChange(item.id, 'inputLabel', e.target.value || undefined)}
          onKeyDown={(e) => e.key === 'Tab' && e.stopPropagation()}
          placeholder={item.label}
          className="w-full bg-surface-2 border border-border rounded px-2 py-1 text-xs outline-none focus:border-accent transition-colors"
        />
      </td>
      {/* Notes */}
      <td className="px-3 py-1.5">
        <input
          type="text"
          value={notesVal}
          onChange={(e) => onChange(item.id, 'patchNotes', e.target.value || undefined)}
          onKeyDown={(e) => e.key === 'Tab' && e.stopPropagation()}
          placeholder={t('patchMap.notesPlaceholder')}
          className="w-full bg-surface-2 border border-border rounded px-2 py-1 text-xs outline-none focus:border-accent transition-colors"
        />
      </td>
    </tr>
  )
}
