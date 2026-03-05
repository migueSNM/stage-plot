import { app, IpcMain, BrowserWindow, shell } from 'electron'
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = null

const RELEASES_URL = 'https://github.com/migueSNM/stage-plot/releases/latest'

export function registerUpdaterHandlers(ipcMain: IpcMain, getWindow: () => BrowserWindow | null): void {
  autoUpdater.on('update-available', (info) => {
    getWindow()?.webContents.send('app:update-available', info.version)
  })

  autoUpdater.on('update-downloaded', () => {
    getWindow()?.webContents.send('app:update-downloaded')
  })

  autoUpdater.on('error', () => {
    getWindow()?.webContents.send('app:update-error')
  })

  ipcMain.handle('app:version', () => app.getVersion())

  ipcMain.handle('app:install-update', () => {
    // setImmediate lets the IPC response be sent before the process quits
    setImmediate(() => {
      try {
        autoUpdater.quitAndInstall()
      } catch {
        // quitAndInstall can fail on macOS without notarization — open download page as fallback
        shell.openExternal(RELEASES_URL)
      }
    })
  })

  ipcMain.handle('app:open-releases', () => {
    shell.openExternal(RELEASES_URL)
  })

  if (app.isPackaged) {
    setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000)
  }
}
