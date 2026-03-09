import { Distress } from 'app/lib/module/distress'
import { MHDDOSProxy } from 'app/lib/module/mhddosproxy'
import { handleModules } from './modules'
import { handleExecutionEngine } from './engine'
import { handleTop } from './top'
import { handleUpdater } from './updater'
import { Settings, handleSettings } from './settings'
import { handleDevelopers } from './developers'
import { handleTray } from './tray'
import { handleActiveness } from './activeness'
import { handleItArmy } from './itarmy'
import { handleHelpers } from './helpers'
import { BrowserWindow } from 'electron'
import { handleSchedule } from './schedule'
import { handleSystem } from './system'

interface MainProcessContext {
  settings: Settings
}

let context: MainProcessContext | null = null

function initMainProcessContext (): MainProcessContext {
  if (context !== null) {
    return context
  }

  const settings = new Settings()
  const modules = [
    new Distress(settings),
    new MHDDOSProxy(settings)
  ]

  handleModules(modules)
  const engine = handleExecutionEngine(modules, settings)
  handleTop()
  handleUpdater(settings, engine)
  handleSettings(settings)
  handleDevelopers()
  handleActiveness(settings)
  handleItArmy(settings)
  handleSchedule(settings, engine)
  handleHelpers()
  handleSystem()

  context = { settings }
  return context
}

export function handle (mainWindow: BrowserWindow) {
  const ctx = initMainProcessContext()
  handleTray(ctx.settings, mainWindow)
}
