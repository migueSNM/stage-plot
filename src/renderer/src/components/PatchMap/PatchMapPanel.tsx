import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'
import type { PatchMapField } from '../../../../shared/types'

const FIELDS: { field: PatchMapField; header: string; placeholder: string; width: string }[] = [
  { field: 'instrument', header: 'patchMap.colInstrument', placeholder: 'patchMap.instrumentPlaceholder', width: 'w-[30%]' },
  { field: 'element', header: 'patchMap.colElement', placeholder: 'patchMap.elementPlaceholder', width: 'w-[30%]' },
  { field: 'notes', header: 'patchMap.colNotes', placeholder: 'patchMap.notesPlaceholder', width: 'flex-1' }
]

export function PatchMapPanel(): JSX.Element {
  const { t } = useTranslation()
  const { patchRows, addPatchRow, updatePatchRow, deletePatchRow, movePatchRow } = useProjectStore()
  const lastRowRef = useRef<HTMLInputElement>(null)
  const prevLengthRef = useRef(patchRows.length)

  // Focus the newly added row's first input when a row is appended
  useEffect(() => {
    if (patchRows.length > prevLengthRef.current) {
      lastRowRef.current?.focus()
    }
    prevLengthRef.current = patchRows.length
  }, [patchRows.length])

  return (
    <aside className="w-[420px] flex-shrink-0 bg-surface border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-widest flex-1 text-muted">
          {t('patchMap.title')}
        </span>
        <button
          onClick={() => void addPatchRow()}
          title={t('patchMap.addRow')}
          className="w-6 h-6 flex items-center justify-center rounded text-muted hover:text-text
                     hover:bg-surface-2 transition-colors cursor-pointer text-base leading-none"
        >
          +
        </button>
      </div>

      {/* Column headers */}
      {patchRows.length > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 border-b border-border text-[10px] font-semibold uppercase tracking-wide text-muted flex-shrink-0 select-none">
          <span className="w-6 text-right flex-shrink-0">{t('patchMap.colNumber')}</span>
          {FIELDS.map(({ field, header, width }) => (
            <span key={field} className={`${width} min-w-0 truncate`}>
              {t(header)}
            </span>
          ))}
          {/* Spacer matching the row-actions column */}
          <span className="w-14 flex-shrink-0" />
        </div>
      )}

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {patchRows.length === 0 ? (
          <p className="text-center text-muted text-[11px] py-6 px-3 leading-snug">
            {t('patchMap.empty')}
          </p>
        ) : (
          patchRows.map((row, idx) => {
            const isLast = idx === patchRows.length - 1
            const isEmpty = !row.instrument && !row.element && !row.notes
            return (
              <div
                key={row.id}
                className="group flex items-center gap-1.5 px-2 py-1 border-b border-border/40 hover:bg-surface-2 transition-colors"
              >
                {/* Input number — auto-generated from position */}
                <span className="w-6 text-[10px] text-muted text-right flex-shrink-0 select-none">
                  {idx + 1}
                </span>

                {FIELDS.map(({ field, placeholder, width }, fieldIdx) => (
                  <input
                    key={field}
                    ref={isLast && fieldIdx === 0 ? lastRowRef : undefined}
                    type="text"
                    value={row[field]}
                    onChange={(e) => void updatePatchRow(row.id, field, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void addPatchRow()
                      // Backspace on a completely empty row removes it
                      if (e.key === 'Backspace' && isEmpty) {
                        e.preventDefault()
                        void deletePatchRow(row.id)
                      }
                    }}
                    placeholder={t(placeholder)}
                    className={`${width} min-w-0 text-[12px] bg-transparent outline-none text-text
                               placeholder:text-muted/40 truncate rounded px-1 -mx-1
                               focus:bg-surface-2`}
                  />
                ))}

                {/* Row actions — visible on hover */}
                <div className="w-14 flex items-center justify-end gap-0.5 flex-shrink-0 invisible group-hover:visible">
                  <button
                    disabled={idx === 0}
                    onClick={() => void movePatchRow(row.id, 'up')}
                    className="w-4 h-4 flex items-center justify-center text-[9px] text-muted
                               hover:text-text disabled:opacity-20 transition-colors cursor-pointer
                               disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    disabled={isLast}
                    onClick={() => void movePatchRow(row.id, 'down')}
                    className="w-4 h-4 flex items-center justify-center text-[9px] text-muted
                               hover:text-text disabled:opacity-20 transition-colors cursor-pointer
                               disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => void deletePatchRow(row.id)}
                    className="w-4 h-4 flex items-center justify-center text-[9px] text-muted
                               hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
