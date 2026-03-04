import { app, shell, IpcMain } from 'electron'

export function registerUpdaterHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:open-release-page', (_event, url: string) => {
    shell.openExternal(url)
  })
}
