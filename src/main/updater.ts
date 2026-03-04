import { net, app, shell, IpcMain } from 'electron'
import type { BrowserWindow } from 'electron'

const REPO = 'miguesnm/stage-plot'
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`
const RELEASES_URL = `https://github.com/${REPO}/releases/latest`

function parseVersion(tag: string): number[] {
  return tag.replace(/^v/, '').split('.').map(Number)
}

function isNewer(latestTag: string, currentVersion: string): boolean {
  const latest = parseVersion(latestTag)
  const current = parseVersion(currentVersion)
  for (let i = 0; i < 3; i++) {
    const l = latest[i] ?? 0
    const c = current[i] ?? 0
    if (l > c) return true
    if (l < c) return false
  }
  return false
}

export async function checkForUpdates(win: BrowserWindow): Promise<void> {
  try {
    const res = await net.fetch(API_URL, {
      headers: { 'User-Agent': `stage-plot/${app.getVersion()}` }
    })
    if (!res.ok) return
    const data = (await res.json()) as { tag_name: string }
    if (isNewer(data.tag_name, app.getVersion())) {
      win.webContents.send('app:update-available', {
        version: data.tag_name.replace(/^v/, ''),
        url: RELEASES_URL
      })
    }
  } catch {
    // Offline or API error — fail silently
  }
}

export function registerUpdaterHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('app:open-release-page', (_event, url: string) => {
    shell.openExternal(url)
  })
}
