import fs from 'fs'
import path from 'path'
import { app, ipcMain, shell } from 'electron'
import { writeStabilityLog } from 'app/lib/utils/stabilityLog'

function getProfileDirectoryPath () {
  return path.join(app.getPath('appData'), 'ITArmyKitProfile')
}

function getStabilityLogFilePath () {
  return path.join(getProfileDirectoryPath(), 'stability.log')
}

export function handleHelpers () {
  ipcMain.handle('helpers:openURLInBrowser', async (_e, url: string) => {
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        console.warn('Blocked external URL with unsupported protocol', parsed.protocol)
        writeStabilityLog({ level: 'warn', source: 'helpers', event: 'blocked-external-url', details: { protocol: parsed.protocol, url } })
        return false
      }
    } catch {
      console.warn('Blocked external URL due to invalid format')
      writeStabilityLog({ level: 'warn', source: 'helpers', event: 'blocked-invalid-url', details: { url } })
      return false
    }
    await shell.openExternal(url)
    return true
  })

  ipcMain.handle('helpers:logRendererEvent', async (_e, event: string, details?: unknown) => {
    writeStabilityLog({
      level: 'error',
      source: 'renderer',
      event,
      details
    })
  })

  ipcMain.handle('helpers:openProfileFolder', async () => {
    const profileDirectoryPath = getProfileDirectoryPath()
    await fs.promises.mkdir(profileDirectoryPath, { recursive: true })
    await shell.openPath(profileDirectoryPath)
  })

  ipcMain.handle('helpers:openStabilityLog', async () => {
    const stabilityLogFilePath = getStabilityLogFilePath()
    await fs.promises.mkdir(path.dirname(stabilityLogFilePath), { recursive: true })
    if (!fs.existsSync(stabilityLogFilePath)) {
      await fs.promises.writeFile(stabilityLogFilePath, '', { encoding: 'utf-8' })
    }
    await shell.openPath(stabilityLogFilePath)
  })
}
