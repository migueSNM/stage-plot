import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '../../store/useProjectStore'

export function PatchMapPanel(): JSX.Element {
  const { t } = useTranslation()
  const { patchRows, addPatchRow, updatePatchRow, deletePatchRow, movePatchRow } = useProjectStore()
  const lastRowRef = useRef<HTMLInputElement>(null)
  const prevLengthRef = useRef(patchRows.length)

  // Focus the newly added row's input when a row is appended
  useEffect(() => {
    if (patchRows.length > prevLengthRef.current) {
      lastRowRef.current?.focus()
    }
    prevLengthRef.current = patchRows.length
  }, [patchRows.length])

  return (
    <aside className="w-52 flex-shrink-0 bg-surface border-l border-border flex flex-col">
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

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {patchRows.length === 0 ? (
          <p className="text-center text-muted text-[11px] py-6 px-3 leading-snug">
            {t('patchMap.empty')}
          </p>
        ) : (
          patchRows.map((row, idx) => (
            <div
              key={row.id}
              className="group flex items-center gap-1.5 px-2 py-1 border-b border-border/40 hover:bg-surface-2 transition-colors"
            >
              {/* Channel number */}
              <span className="w-5 text-[10px] text-muted text-right flex-shrink-0 select-none">
                {idx + 1}
              </span>

              {/* Name input */}
              <input
                ref={idx === patchRows.length - 1 ? lastRowRef : undefined}
                type="text"
                value={row.name}
                onChange={(e) => void updatePatchRow(row.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void addPatchRow()
                  if (e.key === 'Backspace' && row.name === '') {
                    e.preventDefault()
                    void deletePatchRow(row.id)
                  }
                }}
                placeholder={t('patchMap.namePlaceholder')}
                className="flex-1 min-w-0 text-[12px] bg-transparent outline-none text-text
                           placeholder:text-muted/50 truncate"
              />

              {/* Row actions — visible on hover */}
              <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
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
                  disabled={idx === patchRows.length - 1}
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
          ))
        )}
      </div>
    </aside>
  )
}
