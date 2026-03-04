import https from 'node:https'
import { app, shell, IpcMain } from 'electron'
import type { UpdateInfo } from '../shared/types'

const REPO = 'miguesnm/stage-plot'
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

function fetchLatestRelease(): Promise<UpdateInfo | null> {
  return new Promise((resolve) => {
    const req = https.get(
      {
        hostname: 'api.github.com',
        path: `/repos/${REPO}/releases/latest`,
        headers: {
          'User-Agent': `stage-plot/${app.getVersion()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      },
      (res) => {
        let raw = ''
        res.on('data', (chunk: string) => { raw += chunk })
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) { resolve(null); return }
            const data = JSON.parse(raw) as { tag_name: string }
            resolve(
              isNewer(data.tag_name, app.getVersion())
                ? { version: data.tag_name.replace(/^v/, ''), url: RELEASES_URL }
                : null
            )
          } catch {
            resolve(null)
          }
        })
      }
    )
    req.on('error', () => resolve(null))
    // Abort if GitHub doesn't respond within 10 seconds
    req.setTimeout(10000, () => { req.destroy(); resolve(null) })
  })
}

export function registerUpdaterHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:check-update', () => fetchLatestRelease())
  ipcMain.handle('app:open-release-page', (_event, url: string) => {
    shell.openExternal(url)
  })
}
