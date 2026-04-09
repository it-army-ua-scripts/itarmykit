import { app, BrowserWindow, dialog, nativeTheme } from 'electron'
import type { App } from 'electron'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

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
let isQuitting = false

function serializeErrorForLog (error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }

  return error
}

function getWindowDiagnostics (window: BrowserWindow) {
  const webContents = window.webContents

  return {
    bounds: window.getBounds(),
    isVisible: window.isVisible(),
    isFocused: window.isFocused(),
    isMinimized: window.isMinimized(),
    isDestroyed: window.isDestroyed(),
    title: window.getTitle(),
    webContents: {
      id: webContents.id,
      url: webContents.getURL(),
      isLoading: webContents.isLoading(),
      isLoadingMainFrame: webContents.isLoadingMainFrame(),
      isWaitingForResponse: webContents.isWaitingForResponse(),
      isCrashed: webContents.isCrashed(),
      isDestroyed: webContents.isDestroyed(),
      isDevToolsOpened: webContents.isDevToolsOpened(),
      frameRate: webContents.getFrameRate(),
      osProcessId: webContents.getOSProcessId()
    },
    mainProcess: {
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      uptimeSeconds: process.uptime()
    }
  }
}

async function captureRendererDiagnostics (
  window: BrowserWindow,
  trigger: string,
  level: 'info' | 'warn' | 'error',
  details?: unknown
) {
  const windowDiagnostics = getWindowDiagnostics(window)
  const osProcessId = windowDiagnostics.webContents.osProcessId

  let appMetric: unknown
  try {
    appMetric = app.getAppMetrics().find((metric) => metric.pid === osProcessId)
  } catch (error) {
    appMetric = { failed: true, error: serializeErrorForLog(error) }
  }

  logMainProcessEvent(level, 'renderer-diagnostics', {
    trigger,
    details,
    diagnostics: {
      ...windowDiagnostics,
      rendererProcess: {
        appMetric
      }
    }
  })
}

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

function getFilePathFromAppUrl (appUrl: string): string | null {
  if (!appUrl.startsWith('file://')) {
    return null
  }

  try {
    return fileURLToPath(appUrl)
  } catch (error) {
    logMainProcessEvent('warn', 'app-url-to-file-path-failed', { appUrl, error })
    return null
  }
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

  const filePath = getFilePathFromAppUrl(appUrl)
  if (filePath) {
    logMainProcessEvent('info', 'app-url-file-check', {
      appUrl,
      filePath,
      exists: fs.existsSync(filePath)
    })
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
  const createdAt = Date.now()
  logMainProcessEvent('info', 'window-created', { bounds: createdWindow.getBounds() })

  createdWindow.webContents.on('did-finish-load', () => {
    logMainProcessEvent('info', 'did-finish-load', {
      url: createdWindow.webContents.getURL()
    })
  })

  createdWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    logMainProcessEvent('error', 'did-fail-load', {
      errorCode,
      errorDescription,
      validatedURL,
      isMainFrame
    })

    if (isMainFrame) {
      void captureRendererDiagnostics(createdWindow, 'did-fail-load', 'error', {
        errorCode,
        errorDescription,
        validatedURL,
        isMainFrame
      })
    }
  })

  void createdWindow.loadURL(appUrl).catch((error) => {
    logMainProcessEvent('error', 'loadURL failed', {
      error,
      appUrl,
      filePath,
      fileExists: filePath ? fs.existsSync(filePath) : undefined
    })
  })

  if (process.env.DEBUGGING) {
    createdWindow.webContents.openDevTools()
  }

  createdWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
    logMainProcessEvent('error', 'preload-error', {
      preloadPath,
      error: serializeErrorForLog(error)
    })
  })

  createdWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level < 2) {
      return
    }

    logMainProcessEvent(level >= 3 ? 'error' : 'warn', 'renderer-console-message', {
      level,
      message,
      line,
      sourceId
    })
  })

  createdWindow.on('closed', () => {
    logMainProcessEvent('info', 'window-closed', {
      livedForMs: Date.now() - createdAt
    })
    if (mainWindow === createdWindow) {
      mainWindow = undefined
    }
  })

  createdWindow.webContents.on('render-process-gone', (_event, details) => {
    logMainProcessEvent('error', 'render-process-gone', details)
    void captureRendererDiagnostics(createdWindow, 'render-process-gone', 'error', details)
    if (mainWindow !== createdWindow || createdWindow.isDestroyed() || isRecoveringRenderer || isQuitting) {
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
        recoveredWindow.webContents.once('did-finish-load', () => {
          if (!recoveredWindow.isDestroyed()) {
            recoveredWindow.show()
            logMainProcessEvent('warn', 'renderer-recovered', { bounds: winBounds })
          }
        })
        recoveredWindow.webContents.once('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
          logMainProcessEvent('error', 'renderer-recovery-load-failed', {
            bounds: winBounds,
            errorCode,
            errorDescription,
            validatedURL,
            isMainFrame
          })
        })
      }
    } catch (error) {
      logMainProcessEvent('error', 'renderer recovery failed', error)
    } finally {
      isRecoveringRenderer = false
    }
  })

  createdWindow.webContents.on('unresponsive', () => {
    logMainProcessEvent('warn', 'renderer-unresponsive')
    void captureRendererDiagnostics(createdWindow, 'unresponsive', 'warn')
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
    if (isRecoveringRenderer) {
      logMainProcessEvent('info', 'window-all-closed ignored during renderer recovery')
      return
    }

    if (platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    isQuitting = true
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
