import { useTranslation } from 'react-i18next'
import type { StageItem } from '../../../../shared/types'
import { isCableType, isLayerLocked, isPatchableType } from '../../../../shared/itemExtras'

export interface ContextMenuData {
  x: number
  y: number
  itemId: string
}

interface ContextMenuProps {
  contextMenu: ContextMenuData
  selectedIds: string[]
  contextMenuItem: StageItem | undefined
  onStartEditing: (item: StageItem) => void
  onRotate: (deg: number) => void
  onChangeColor: (itemId: string) => void
  onBringToFront: (id: string) => void
  onSendToBack: (id: string) => void
  onToggleLock: (id: string) => void
  onDelete: (ids: string[]) => void
  onEditPatchInfo?: (id: string) => void
  onClose: () => void
}

export function ContextMenu({
  contextMenu,
  selectedIds,
  contextMenuItem,
  onStartEditing,
  onRotate,
  onChangeColor,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onDelete,
  onEditPatchInfo,
  onClose
}: ContextMenuProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div
      className="fixed z-50 bg-surface border border-border rounded-lg shadow-2xl py-1 min-w-44 overflow-hidden"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {selectedIds.length === 1 && contextMenuItem && !isCableType(contextMenuItem.type) && (
        <>
          {contextMenuItem.type === 'text' && (
            <>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => { if (contextMenuItem) onStartEditing(contextMenuItem) }}
              >
                ✏️ {t('contextMenu.rename')}
              </button>
              <div className="h-px bg-border mx-2 my-1" />
            </>
          )}
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => onRotate(90)}
          >
            🔃 {t('contextMenu.rotateCW')}
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => onRotate(-90)}
          >
            🔄 {t('contextMenu.rotateCCW')}
          </button>
          <div className="h-px bg-border mx-2 my-1" />
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => { onChangeColor(contextMenu.itemId); onClose() }}
          >
            🎨 {t('contextMenu.changeColor')}
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => { onBringToFront(contextMenu.itemId); onClose() }}
          >
            ⬆️ {t('contextMenu.bringToFront')}
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => { onSendToBack(contextMenu.itemId); onClose() }}
          >
            ⬇️ {t('contextMenu.sendToBack')}
          </button>
          <div className="h-px bg-border mx-2 my-1" />
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => { onToggleLock(contextMenu.itemId); onClose() }}
          >
            {isLayerLocked(contextMenuItem)
              ? `🔓 ${t('contextMenu.unlockLayer')}`
              : `🔒 ${t('contextMenu.lockLayer')}`}
          </button>
          {isPatchableType(contextMenuItem.type) && onEditPatchInfo && (
            <>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
                onClick={() => { onEditPatchInfo(contextMenu.itemId); onClose() }}
              >
                🎛 {t('contextMenu.editPatchInfo')}
              </button>
            </>
          )}
          <div className="h-px bg-border mx-2 my-1" />
        </>
      )}
      {selectedIds.length === 1 && contextMenuItem && isCableType(contextMenuItem.type) && (
        <>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-surface-2 transition-colors flex items-center gap-2"
            onClick={() => { onChangeColor(contextMenu.itemId); onClose() }}
          >
            🎨 {t('contextMenu.changeColor')}
          </button>
          <div className="h-px bg-border mx-2 my-1" />
        </>
      )}
      <button
        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-2 transition-colors flex items-center gap-2"
        onClick={() => { onDelete(selectedIds); onClose() }}
      >
        🗑{' '}
        {selectedIds.length > 1
          ? t('contextMenu.deleteSelected', { count: selectedIds.length })
          : t('contextMenu.delete')}
      </button>
    </div>
  )
}
