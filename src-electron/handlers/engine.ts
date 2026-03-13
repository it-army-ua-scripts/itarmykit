import fs from 'fs'
import path from 'path'
import { WebContents, app, ipcMain } from 'electron'
import { Settings } from './settings'
import { Mutex } from 'async-mutex'

import { Distress } from 'app/lib/module/distress'
import { MHDDOSProxy } from 'app/lib/module/mhddosproxy'
import {
  ModuleExecutionErrorEventData,
  ModuleExecutionStatisticsEventData,
  ModuleExecutionStdoutEventData,
  ModuleName
} from 'app/lib/module/module'
import { writeFileAtomicWithBackup } from 'app/lib/utils/atomicFile'
import { writeStabilityLog } from 'app/lib/utils/stabilityLog'

export interface ExecutionLogEntry {
  type: 'STARTED' | 'STOPPED' | 'ERROR'
  moduleName: ModuleName
  timestamp: number
  message: string
}

export interface StatisticsTotals {
  totalBytesSent: number
}

export interface State {
  moduleToRun?: ModuleName
  run: boolean
  executionLog: Array<ExecutionLogEntry>
  stdOut: Array<string>
  stdErr: Array<string>
  statistics: Array<ModuleExecutionStatisticsEventData>
  statisticsTotals: StatisticsTotals
}

function createDefaultState (): State {
  return {
    run: false,
    executionLog: [],
    statistics: [],
    stdErr: [],
    stdOut: [],
    statisticsTotals: { totalBytesSent: 0 }
  }
}

export class ExecutionEngine {
  private logEvent (level: 'info' | 'warn' | 'error', event: string, details?: unknown) {
    writeStabilityLog({
      level,
      source: 'execution-engine',
      event,
      details
    })
  }

  private static stateFilePath = path.join(app.getPath('appData'), 'ITArmyKitProfile', 'engine.state.json')
  private static stateBackupFilePath = path.join(app.getPath('appData'), 'ITArmyKitProfile', 'engine.state.json.bak')
  private static stateTempFilePath = path.join(app.getPath('appData'), 'ITArmyKitProfile', 'engine.state.json.tmp')

  private modules: Array<Distress | MHDDOSProxy> = []
  private runningModule: Distress | MHDDOSProxy | null
  private state?: State
  private settings: Settings
  private stateLock: Mutex = new Mutex()

  constructor (modules: Array<Distress | MHDDOSProxy>, settings: Settings) {
    this.modules = modules
    this.settings = settings
    this.runningModule = null

    for (const module of modules) {
      module.on('execution:started', () => {
        const entry: ExecutionLogEntry = {
          type: 'STARTED',
          moduleName: module.name,
          timestamp: Date.now(),
          message: `Module ${module.name} started`
        }

        this.broadcast(this.executionLogListeners, 'executionEngine:executionLog', entry)
        this.persistSafely(this.appendToExecutionLog(entry), 'append execution log:started')
      })

      module.on('execution:stdout', (data) => {
        const payload = (data as ModuleExecutionStdoutEventData).data
        this.broadcast(this.stdOutListeners, 'executionEngine:stdout', payload)
        this.persistSafely(this.appendToStdOut(payload), 'append stdout')
      })

      module.on('execution:stderr', (data) => {
        const payload = (data as ModuleExecutionStdoutEventData).data
        this.broadcast(this.stdErrListeners, 'executionEngine:stderr', payload)
        this.persistSafely(this.appendToStdErr(payload), 'append stderr')
      })

      module.on('execution:stopped', () => {
        const entry: ExecutionLogEntry = {
          type: 'STOPPED',
          moduleName: module.name,
          timestamp: Date.now(),
          message: `Module ${module.name} stopped`
        }

        if (this.runningModule?.name === module.name) {
          this.runningModule = null
        }

        this.broadcast(this.executionLogListeners, 'executionEngine:executionLog', entry)
        this.persistSafely(this.appendToExecutionLog(entry), 'append execution log:stopped')
      })

      module.on('execution:error', (error) => {
        const entry: ExecutionLogEntry = {
          type: 'ERROR',
          moduleName: module.name,
          timestamp: Date.now(),
          message: `Module ${module.name} error: ${(error as ModuleExecutionErrorEventData).error}`
        }

        this.broadcast(this.executionLogListeners, 'executionEngine:executionLog', entry)
        this.persistSafely(this.appendToExecutionLog(entry), 'append execution log:error')
      })

      module.on('execution:statistics', (data) => {
        const payload = data as ModuleExecutionStatisticsEventData
        this.broadcast(this.statisticsListeners, 'executionEngine:statistics', payload)
        this.persistSafely(this.appendToStatistics(payload), 'append statistics')
      })
    }
  }

  private persistSafely (promise: Promise<void>, context: string) {
    void promise.catch((error) => {
      console.warn(`[ExecutionEngine] Failed to ${context}`, error)
    })
  }

  private async appendToExecutionLog (entry: ExecutionLogEntry) {
    await this.stateLock.runExclusive(async () => {
      const state = await this.getState()
      state.executionLog.push(entry)
      if (state.executionLog.length > 100) {
        state.executionLog.shift()
      }
      await this.setState(state)
    })
  }

  private async appendToStdOut (data: string) {
    await this.stateLock.runExclusive(async () => {
      const state = await this.getState()
      state.stdOut.push(data)
      if (state.stdOut.length > 100) {
        state.stdOut.shift()
      }
      await this.setState(state)
    })
  }

  private async appendToStdErr (data: string) {
    await this.stateLock.runExclusive(async () => {
      const state = await this.getState()
      state.stdErr.push(data)
      if (state.stdErr.length > 100) {
        state.stdErr.shift()
      }
      await this.setState(state)
    })
  }

  private async appendToStatistics (data: ModuleExecutionStatisticsEventData) {
    await this.stateLock.runExclusive(async () => {
      const state = await this.getState()
      state.statistics.push(data)
      if (state.statistics.length > 100) {
        state.statistics.shift()
      }
      state.statisticsTotals.totalBytesSent += data.bytesSend
      await this.setState(state)
    })
  }

  private isWebContentsAlive (webContents: WebContents): boolean {
    return !webContents.isDestroyed() && !webContents.isCrashed()
  }

  private addListener (listeners: Array<WebContents>, webContents: WebContents) {
    if (!this.isWebContentsAlive(webContents)) {
      return
    }

    if (!listeners.includes(webContents)) {
      listeners.push(webContents)
      webContents.once('destroyed', () => {
        this.removeListener(listeners, webContents)
      })
    }
  }

  private removeListener (listeners: Array<WebContents>, webContents: WebContents) {
    const index = listeners.indexOf(webContents)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  private broadcast (listeners: Array<WebContents>, channel: string, payload: unknown) {
    for (const listener of [...listeners]) {
      if (!this.isWebContentsAlive(listener)) {
        this.removeListener(listeners, listener)
        continue
      }

      try {
        listener.send(channel, payload)
      } catch (error) {
        this.removeListener(listeners, listener)
        console.warn(`[ExecutionEngine] Failed to send ${channel}`, error)
      }
    }
  }

  public async init () {
    const config = await this.getState()
    if (!config.run) {
      return
    }

    if (config.moduleToRun) {
      try {
        await this.startModule()
      } catch (error) {
        console.warn('[ExecutionEngine] Failed to restore running module on startup', error)
        this.logEvent('error', 'restore-running-module-failed', error)
        await this.stateLock.runExclusive(async () => {
          const updated = await this.getState()
          updated.run = false
          await this.setState(updated)
        })
      }
      return
    }

    await this.stateLock.runExclusive(async () => {
      const updated = await this.getState()
      updated.run = false
      await this.setState(updated)
    })
  }

  public async setModuleToRun (module?: ModuleName) {
    await this.stateLock.runExclusive(async () => {
      const config = await this.getState()
      config.moduleToRun = module
      await this.setState(config)
    })
    await this.settings.setExecutionModuleToRun(module)
    this.logEvent('info', 'module-selected', { module })
  }

  public async startModule () {
    if (this.runningModule != null) {
      throw new Error(`Module ${this.runningModule.name} is already running`)
    }

    let moduleName: ModuleName | undefined

    await this.stateLock.runExclusive(async () => {
      const config = await this.getState()
      moduleName = config.moduleToRun
      config.run = true
      config.stdOut = []
      config.stdErr = []
      await this.setState(config)
    })

    if (!moduleName) {
      await this.stateLock.runExclusive(async () => {
        const config = await this.getState()
        config.run = false
        await this.setState(config)
      })
      this.logEvent('warn', 'start-without-module')
      throw new Error('Module to run is not set')
    }

    const module = this.modules.find((candidate) => candidate.name === moduleName)
    if (!module) {
      await this.stateLock.runExclusive(async () => {
        const config = await this.getState()
        config.run = false
        await this.setState(config)
      })
      throw new Error(`Module ${moduleName} not found`)
    }

    try {
      await module.start()
      this.runningModule = module
    } catch (error) {
      await this.stateLock.runExclusive(async () => {
        const config = await this.getState()
        config.run = false
        await this.setState(config)
      })
      this.logEvent('error', 'module-start-failed', { moduleName, error })
      throw error
    }
  }

  public async stopModule () {
    if (this.runningModule == null) {
      return
    }

    const module = this.runningModule
    this.runningModule = null

    try {
      await module.stop()
    } finally {
      await this.stateLock.runExclusive(async () => {
        const config = await this.getState()
        config.run = false
        await this.setState(config)
      })
    }
  }

  public async dispose () {
    const module = this.runningModule
    this.runningModule = null

    if (module != null) {
      this.logEvent('info', 'module-stopping', { moduleName: module.name })
    }

    if (module != null) {
      try {
        await module.stop()
        this.logEvent('info', 'dispose-stopped-module', { moduleName: module.name })
      } catch (error) {
        console.warn('[ExecutionEngine] Failed to dispose running module', error)
        this.logEvent('error', 'dispose-stop-failed', { moduleName: module.name, error })
      }
    }

    await this.stateLock.runExclusive(async () => {
      const config = await this.getState()
      config.run = false
      await this.setState(config)
    })
  }

  public async getState (): Promise<State> {
    if (this.state === undefined) {
      try {
        const configString = await fs.promises.readFile(ExecutionEngine.stateFilePath, 'utf8')
        const parsed = JSON.parse(configString) as Partial<State>
        this.state = {
          ...createDefaultState(),
          ...parsed,
          executionLog: Array.isArray(parsed.executionLog) ? parsed.executionLog : [],
          stdOut: Array.isArray(parsed.stdOut) ? parsed.stdOut : [],
          stdErr: Array.isArray(parsed.stdErr) ? parsed.stdErr : [],
          statistics: Array.isArray(parsed.statistics) ? parsed.statistics : [],
          statisticsTotals: parsed.statisticsTotals && typeof parsed.statisticsTotals.totalBytesSent === 'number'
            ? parsed.statisticsTotals
            : { totalBytesSent: 0 }
        }
      } catch {
        try {
          const backupString = await fs.promises.readFile(ExecutionEngine.stateBackupFilePath, 'utf8')
          const parsed = JSON.parse(backupString) as Partial<State>
          this.state = {
            ...createDefaultState(),
            ...parsed,
            executionLog: Array.isArray(parsed.executionLog) ? parsed.executionLog : [],
            stdOut: Array.isArray(parsed.stdOut) ? parsed.stdOut : [],
            stdErr: Array.isArray(parsed.stdErr) ? parsed.stdErr : [],
            statistics: Array.isArray(parsed.statistics) ? parsed.statistics : [],
            statisticsTotals: parsed.statisticsTotals && typeof parsed.statisticsTotals.totalBytesSent === 'number'
              ? parsed.statisticsTotals
              : { totalBytesSent: 0 }
          }
          console.warn('[ExecutionEngine] Recovered state from backup file')
          this.logEvent('warn', 'state-recovered-from-backup')
          await this.setState(this.state)
        } catch {
          this.state = createDefaultState()
          await this.setState(this.state)
        }
      }
    }

    if (this.state.statisticsTotals === undefined) {
      this.state.statisticsTotals = { totalBytesSent: 0 }
    }

    if (this.state.moduleToRun === undefined) {
      try {
        const settingsData = await this.settings.getData()
        if (settingsData.execution?.moduleToRun) {
          this.state.moduleToRun = settingsData.execution.moduleToRun
          console.warn('[ExecutionEngine] Recovered moduleToRun from settings')
          this.logEvent('warn', 'module-recovered-from-settings', { moduleToRun: this.state.moduleToRun })
          await this.setState(this.state)
        }
      } catch {
        // ignore recovery errors
      }
    }

    return this.state
  }

  private async setState (config: State) {
    this.state = config
    const payload = JSON.stringify(config)
    await writeFileAtomicWithBackup({
      targetPath: ExecutionEngine.stateFilePath,
      tempPath: ExecutionEngine.stateTempFilePath,
      backupPath: ExecutionEngine.stateBackupFilePath,
      data: payload
    })
  }

  private executionLogListeners: Array<WebContents> = []
  public startListeningForExecutionLog (webContents: WebContents) {
    this.addListener(this.executionLogListeners, webContents)
  }

  public stopListeningForExecutionLog (webContents: WebContents) {
    this.removeListener(this.executionLogListeners, webContents)
  }

  private stdOutListeners: Array<WebContents> = []
  public startListeningForStdOut (webContents: WebContents) {
    this.addListener(this.stdOutListeners, webContents)
  }

  public stopListeningForStdOut (webContents: WebContents) {
    this.removeListener(this.stdOutListeners, webContents)
  }

  private stdErrListeners: Array<WebContents> = []
  public startListeningForStdErr (webContents: WebContents) {
    this.addListener(this.stdErrListeners, webContents)
  }

  public stopListeningForStdErr (webContents: WebContents) {
    this.removeListener(this.stdErrListeners, webContents)
  }

  private statisticsListeners: Array<WebContents> = []
  public startListeningForStatistics (webContents: WebContents) {
    this.addListener(this.statisticsListeners, webContents)
  }

  public stopListeningForStatistics (webContents: WebContents) {
    this.removeListener(this.statisticsListeners, webContents)
  }

  public async deleteStatistics () {
    await this.stateLock.runExclusive(async () => {
      const config = await this.getState()
      config.statistics = []
      config.statisticsTotals.totalBytesSent = 0
      await this.setState(config)
    })
  }
}

export function handleExecutionEngine (modules: Array<Distress | MHDDOSProxy>, settings: Settings): ExecutionEngine {
  const engine = new ExecutionEngine(modules, settings)
  const disableSchedulerForManualControl = async () => {
    const currentSettings = await settings.getData()
    if (currentSettings.schedule.enabled) {
      await settings.setScheduleEnabled(false)
    }
  }

  app.on('before-quit', () => {
    void engine.dispose()
  })

  ipcMain.handle('executionEngine:startModule', async () => {
    await disableSchedulerForManualControl()
    await engine.startModule()
  })

  ipcMain.handle('executionEngine:stopModule', async () => {
    await disableSchedulerForManualControl()
    await engine.stopModule()
  })

  ipcMain.handle('executionEngine:getState', async () => {
    return await engine.getState()
  })

  ipcMain.handle('executionEngine:setModuleToRun', async (_e, module?: ModuleName) => {
    await disableSchedulerForManualControl()
    await engine.setModuleToRun(module)
  })

  ipcMain.handle('executionEngine:listenForExecutionLog', async (e) => {
    engine.startListeningForExecutionLog(e.sender)
  })
  ipcMain.handle('executionEngine:stopListeningForExecutionLog', async (e) => {
    engine.stopListeningForExecutionLog(e.sender)
  })

  ipcMain.handle('executionEngine:listenForStdOut', async (e) => {
    engine.startListeningForStdOut(e.sender)
  })
  ipcMain.handle('executionEngine:stopListeningForStdOut', async (e) => {
    engine.stopListeningForStdOut(e.sender)
  })

  ipcMain.handle('executionEngine:listenForStdErr', async (e) => {
    engine.startListeningForStdErr(e.sender)
  })
  ipcMain.handle('executionEngine:stopListeningForStdErr', async (e) => {
    engine.stopListeningForStdErr(e.sender)
  })

  ipcMain.handle('executionEngine:listenForStatistics', async (e) => {
    engine.startListeningForStatistics(e.sender)
  })
  ipcMain.handle('executionEngine:stopListeningForStatistics', async (e) => {
    engine.stopListeningForStatistics(e.sender)
  })
  ipcMain.handle('executionEngine:deleteStatistics', async () => {
    await engine.deleteStatistics()
  })

  void engine.init().catch((error) => {
    console.warn('[ExecutionEngine] Failed to initialize', error)
  })

  return engine
}
