import { DB1000N } from 'app/lib/module/db1000n'
import { Distress } from 'app/lib/module/distress'
import { MHDDOSProxy } from 'app/lib/module/mhddosproxy'
import { handleModules } from './modules'
import { handleExecutionEngine } from './engine'
import { handleTop } from './top'
import { handleUpdater } from './updater'
import { Settings, handleSettings } from './settings'
import { handleDevelopers } from './developers'
import { handleTray } from './tray'
import { BrowserWindow } from 'electron'

export function handle (mainWindow: BrowserWindow) {
  const settings = new Settings()
  
  const modules = [
    new Distress(settings),
    new MHDDOSProxy(settings),
    new DB1000N(settings)
  ]

  handleModules(modules)
  handleExecutionEngine(modules)
  handleTop()
  handleUpdater(settings)
  handleTray(settings, mainWindow)
  handleSettings(settings)
  handleDevelopers()
}
