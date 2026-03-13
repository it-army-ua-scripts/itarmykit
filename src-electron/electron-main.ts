import { app, BrowserWindow, dialog, nativeTheme } from 'electron'
import type { App } from 'electron'
import path from 'path'
import os from 'os'
import { execFileSync } from 'child_process'

import { handle } from './handlers'
import { writeStabilityLog } from 'app/lib/utils/stabilityLog'

const platform = process.platform || os.platform()

const APP_DISPLAY_NAME = 'IT Army Kit'
const APP_ID = 'itarmykit'
const desktopNameApp = app as App & { setDesktopName?: (name: string) => void }

app.setName(APP_DISPLAY_NAME)
if (platform === 'win32') {
  app.setAppUserModelId(APP_ID)
} else if (platform === 'linux') {
  desktopNameApp.setDesktopName?.(`${APP_ID}.desktop`)
} else if (platform === 'darwin') {
  app.setName(APP_DISPLAY_NAME)
}

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
} catch (_) {}

let mainWindow: BrowserWindow | undefined
let isRecoveringRenderer = false
let hasShownRuntimeWarning = false

function logMainProcessEvent (level: 'info' | 'warn' | 'error', origin: string, details?: unknown) {
  if (level === 'error') {
    console.error(`[main] ${origin}`, details)
  } else if (level === 'warn') {
    console.warn(`[main] ${origin}`, details)
  } else {
    console.log(`[main] ${origin}`, details)
  }

  writeStabilityLog({
    level,
    source: 'main',
    event: origin,
    details
  })
}

process.on('uncaughtException', (error) => {
  logMainProcessEvent('error', 'uncaughtException', error)
})

process.on('unhandledRejection', (reason) => {
  logMainProcessEvent('error', 'unhandledRejection', reason)
})

function getRequiredRuntimeRegistryKey () {
  if (platform !== 'win32') {
    return null
  }

  if (process.arch === 'arm64') {
    return 'HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\arm64'
  }

  return 'HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64'
}

function isRequiredWindowsRuntimeInstalled () {
  const registryKey = getRequiredRuntimeRegistryKey()
  if (!registryKey) {
    return true
  }

  try {
    const output = execFileSync('reg', ['query', registryKey, '/v', 'Installed'], {
      windowsHide: true,
      encoding: 'utf8'
    })

    return /Installed\s+REG_DWORD\s+0x1/i.test(output)
  } catch (error) {
    logMainProcessEvent('warn', 'runtime-registry-check-failed', { registryKey, error })
    return true
  }
}

async function checkWindowsRuntimePrerequisite () {
  if (platform !== 'win32') {
    return
  }

  const installed = isRequiredWindowsRuntimeInstalled()
  logMainProcessEvent(installed ? 'info' : 'warn', installed ? 'runtime-check-passed' : 'runtime-check-missing', {
    arch: process.arch
  })

  if (installed || hasShownRuntimeWarning) {
    return
  }

  hasShownRuntimeWarning = true
  await dialog.showMessageBox({
    type: 'warning',
    title: 'Microsoft Visual C++ Redistributable may be missing',
    message: 'ITArmyKit detected that the required Microsoft Visual C++ runtime may be missing.',
    detail: 'The app was installed, but some modules may fail to start. If you see module startup errors, install the Microsoft Visual C++ Redistributable for this system and restart ITArmyKit.'
  })
}

function createWindow () {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return
  }

  let appIcon: string | undefined
  if (platform === 'win32') {
    appIcon = path.resolve(__dirname, 'icons', 'icon.ico')
  } else if (platform === 'linux') {
    appIcon = path.resolve(__dirname, 'icons', '256x256.png')
  }

  const preloadPath = process.env.QUASAR_ELECTRON_PRELOAD
  if (!preloadPath) {
    throw new Error('QUASAR_ELECTRON_PRELOAD is not defined')
  }

  const appUrl = process.env.APP_URL
  if (!appUrl) {
    throw new Error('APP_URL is not defined')
  }

  const createdWindow = new BrowserWindow({
    icon: appIcon,
    width: 1400,
    height: 660,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(__dirname, preloadPath)
    },
    show: false
  })
  mainWindow = createdWindow
  logMainProcessEvent('info', 'window-created', { bounds: createdWindow.getBounds() })

  void createdWindow.loadURL(appUrl).catch((error) => {
    logMainProcessEvent('error', 'loadURL failed', error)
  })

  if (process.env.DEBUGGING) {
    createdWindow.webContents.openDevTools()
  }

  createdWindow.on('closed', () => {
    logMainProcessEvent('info', 'window-closed')
    if (mainWindow === createdWindow) {
      mainWindow = undefined
    }
  })

  createdWindow.webContents.on('render-process-gone', (_event, details) => {
    logMainProcessEvent('error', 'render-process-gone', details)
    if (mainWindow !== createdWindow || createdWindow.isDestroyed() || isRecoveringRenderer) {
      return
    }

    isRecoveringRenderer = true
    try {
      const winBounds = createdWindow.getBounds()
      createdWindow.destroy()
      mainWindow = undefined
      createWindow()
      const recoveredWindow = mainWindow as BrowserWindow | undefined
      if (recoveredWindow) {
        recoveredWindow.setBounds(winBounds)
        recoveredWindow.show()
        logMainProcessEvent('warn', 'renderer-recovered', { bounds: winBounds })
      }
    } catch (error) {
      logMainProcessEvent('error', 'renderer recovery failed', error)
    } finally {
      isRecoveringRenderer = false
    }
  })

  createdWindow.webContents.on('unresponsive', () => {
    logMainProcessEvent('warn', 'renderer-unresponsive')
  })

  handle(createdWindow)
}

if (!app.requestSingleInstanceLock()) {
  logMainProcessEvent('warn', 'second-instance-lock-failed')
  app.quit()
} else {
  app.on('second-instance', () => {
    logMainProcessEvent('info', 'second-instance-activated')
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })

  if (process.platform === 'win32') {
    app.commandLine.appendSwitch('disable-http-cache')
  }

  app.whenReady().then(async () => {
    logMainProcessEvent('info', 'app-ready')
    try {
      createWindow()
      await checkWindowsRuntimePrerequisite()
    } catch (error) {
      logMainProcessEvent('error', 'createWindow failed', error)
    }
  }).catch((error) => {
    logMainProcessEvent('error', 'app.whenReady failed', error)
  })

  app.on('window-all-closed', () => {
    logMainProcessEvent('info', 'window-all-closed')
    if (platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    logMainProcessEvent('info', 'before-quit')
  })

  app.on('activate', () => {
    if (mainWindow === undefined) {
      try {
        createWindow()
      } catch (error) {
        logMainProcessEvent('error', 'activate -> createWindow failed', error)
      }
    }
  })
}
