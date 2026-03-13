import { BrowserWindow, Tray, app, Menu, nativeImage, Notification } from 'electron'
import type { Event as ElectronEvent } from 'electron'
import path from 'path'
import { Settings } from './settings'

const lang: Record<'en-US' | 'ua-UA' | 'de-DE', { open: string, exit: string }> = {
  'en-US': {
    open: 'Open',
    exit: 'Exit'
  },
  'ua-UA': {
    open: 'Відкрити',
    exit: 'Вийти'
  },
  'de-DE': {
    open: 'Öffnen',
    exit: 'Beenden'
  }
} as const

let tray: Tray | null = null
let isQuiting = false
let beforeQuitListenerRegistered = false
let activeMainWindow: BrowserWindow | null = null
let boundCloseWindow: BrowserWindow | null = null
let boundCloseListener: ((event: ElectronEvent) => void) | null = null

const hiddenInTrayMessageByLocale: Record<'en-US' | 'ua-UA' | 'de-DE', string> = {
  'en-US': 'Application is hidden in tray. Double-click the tray icon to open it.',
  'ua-UA': 'Застосунок приховано в треї. Подвійний клік по іконці трея відкриє його.',
  'de-DE': 'Die Anwendung wurde im Tray ausgeblendet. Doppelklick auf das Tray-Symbol, um sie zu öffnen.'
}

function showHiddenInTrayNotification (locale: 'en-US' | 'ua-UA' | 'de-DE') {
  if (!Notification.isSupported()) {
    return
  }

  new Notification({
    title: 'IT Army Kit',
    body: hiddenInTrayMessageByLocale[locale],
    silent: true
  }).show()
}

export function handleTray (settings: Settings, mainWindow: BrowserWindow) {
  activeMainWindow = mainWindow

  if (!beforeQuitListenerRegistered) {
    app.on('before-quit', () => {
      isQuiting = true
    })
    beforeQuitListenerRegistered = true
  }

  const settingsData = settings.getDataSync()
  const locale = settingsData.system.language
  let translation = lang['en-US']
  if (locale in lang) {
    translation = lang[locale as keyof typeof lang]
  }

  if (tray === null) {
    tray = new Tray(nativeImage.createEmpty())
    const appIcon = nativeImage.createFromPath(path.resolve(__dirname, 'icons/trey.png'))
    tray.setImage(appIcon)
    tray.setToolTip('IT Army Kit')
    tray.on('double-click', () => {
      if (!activeMainWindow || activeMainWindow.isDestroyed()) {
        return
      }
      if (activeMainWindow.isVisible()) {
        activeMainWindow.hide()
      } else {
        activeMainWindow.show()
      }
    })
  }

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: translation.open,
        click: function () {
          if (activeMainWindow && !activeMainWindow.isDestroyed()) {
            activeMainWindow.show()
          }
        }
      },
      {
        label: translation.exit,
        click: function () {
          isQuiting = true
          app.quit()
        }
      }
    ])
  )

  if (boundCloseWindow && boundCloseListener) {
    boundCloseWindow.removeListener('close', boundCloseListener)
  }

  boundCloseListener = function (event) {
    const latestSettingsData = settings.getDataSync()

    if (!isQuiting && latestSettingsData.system.hideInTray) {
      event.preventDefault()
      if (activeMainWindow && !activeMainWindow.isDestroyed()) {
        activeMainWindow.hide()
      }
      showHiddenInTrayNotification(locale)
    }
  }
  mainWindow.on('close', boundCloseListener)
  boundCloseWindow = mainWindow

  mainWindow.on('closed', () => {
    if (activeMainWindow === mainWindow) {
      activeMainWindow = null
    }
  })

  const isBootstrapIncomplete = settingsData.bootstrap.step !== 'DONE'
  if (!isBootstrapIncomplete && settingsData.system.hideInTray) {
    mainWindow.hide()
  } else {
    mainWindow.show()
  }
}
