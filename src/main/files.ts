import { dialog, IpcMain, BrowserWindow } from 'electron'
import fs from 'node:fs'
import type { StagePlotExportData } from '../shared/types'

export function registerFileHandlers(
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void {
  ipcMain.handle('file:exportJson', async (_event, data: StagePlotExportData) => {
    const win = getMainWindow()
    const result = await dialog.showSaveDialog(win ?? undefined!, {
      title: 'Export Stage Plot',
      defaultPath: `${data.project.name}.stageplot`,
      filters: [{ name: 'Stage Plot', extensions: ['stageplot'] }]
    })
    if (result.canceled || !result.filePath) return false
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  })

  ipcMain.handle('file:importJson', async (_event) => {
    const win = getMainWindow()
    const result = await dialog.showOpenDialog(win ?? undefined!, {
      title: 'Import Stage Plot',
      filters: [
        { name: 'Stage Plot', extensions: ['stageplot', 'json'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled || !result.filePaths.length) return null
    try {
      const raw = fs.readFileSync(result.filePaths[0], 'utf-8')
      const parsed = JSON.parse(raw)
      if (
        typeof parsed.version !== 'number' ||
        !parsed.project ||
        !Array.isArray(parsed.items)
      ) {
        return null
      }
      return parsed as StagePlotExportData
    } catch {
      return null
    }
  })
}
