import { app, IpcMain, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = null

export function registerUpdaterHandlers(ipcMain: IpcMain, getWindow: () => BrowserWindow | null): void {
  autoUpdater.on('update-available', (info) => {
    getWindow()?.webContents.send('app:update-available', info.version)
  })

  autoUpdater.on('update-downloaded', () => {
    getWindow()?.webContents.send('app:update-downloaded')
  })

  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:install-update', () => autoUpdater.quitAndInstall())

  // Skip update check in development
  if (app.isPackaged) {
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000)
  }
}
