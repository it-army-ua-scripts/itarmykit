/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * Keep this preload surface narrow and expose only the APIs the renderer actually needs.
 * Avoid re-introducing legacy Electron patterns such as remote access or broad Node exposure.
 */

import type { Config as DistressConfig } from 'app/lib/module/distress'
import type { Config as MHDDOSProxyConfig } from 'app/lib/module/mhddosproxy'
import type { InstallProgress, ModuleExecutionStatisticsEventData, ModuleName, Version } from 'app/lib/module/module'
import type { IpcRendererEvent } from 'electron'
import { contextBridge, ipcRenderer } from 'electron'
import type { State as ExecutionEngineState, ExecutionLogEntry } from './handlers/engine'
import type { TopData } from './handlers/top'
import type { SettingsData } from './handlers/settings'
import type { Contributor } from './handlers/developers'
import type {
  GetStatsResponse as GetActivenessStatsResponse,
  GetTasksListResponse as GetActivenessTasksListResponse,
  MakeTaskDoneResponse as MakeActivenessTaskDoneResponse,
  IgnoreTaskResponse as IgnoreActivenessTaskResponse
} from '../lib/activeness/api'
import type { GetUserStatsResponse as GetITArmyUserStatsResponse } from '../lib/itarmy/api'

type ModuleConfig = DistressConfig | MHDDOSProxyConfig
type RendererListener<T> = (_e: IpcRendererEvent, data: T) => void

type ListenerRegistryEntry = {
  callbacks: Set<RendererListener<unknown>>
  dispatcher: RendererListener<unknown>
  listenChannel: string
  stopChannel: string
}

const listenerRegistry = new Map<string, ListenerRegistryEntry>()

async function invoke<TReturn> (channel: string, ...args: unknown[]): Promise<TReturn> {
  return await ipcRenderer.invoke(channel, ...args) as TReturn
}

async function startListening<T> (listenChannel: string, eventChannel: string, callback: RendererListener<T>): Promise<void> {
  let entry = listenerRegistry.get(eventChannel)

  if (!entry) {
    const callbacks = new Set<RendererListener<unknown>>()
    const dispatcher: RendererListener<unknown> = (event, data) => {
      for (const registeredCallback of callbacks) {
        registeredCallback(event, data)
      }
    }

    entry = {
      callbacks,
      dispatcher,
      listenChannel,
      stopChannel: listenChannel.replace(':listenFor', ':stopListeningFor')
    }

    listenerRegistry.set(eventChannel, entry)
    ipcRenderer.on(eventChannel, dispatcher)
    await invoke<void>(listenChannel)
  }

  entry.callbacks.add(callback as RendererListener<unknown>)
}

async function stopListening<T> (stopChannel: string, eventChannel: string, callback: RendererListener<T>): Promise<void> {
  const entry = listenerRegistry.get(eventChannel)
  if (!entry) {
    return
  }

  entry.callbacks.delete(callback as RendererListener<unknown>)
  if (entry.callbacks.size > 0) {
    return
  }

  ipcRenderer.off(eventChannel, entry.dispatcher)
  listenerRegistry.delete(eventChannel)
  await invoke<void>(stopChannel)
}

const modulesAPI = {
  async getAllVersions (moduleName: ModuleName): Promise<Version[]> {
    return await invoke<Version[]>('modules:getAllVersions', moduleName)
  },
  async installVersion (moduleName: ModuleName, versionTag: string, progressCallback: (progress: InstallProgress) => void): Promise<void> {
    const handleProgress = (_e: IpcRendererEvent, progressModuleName: ModuleName, progressVersionTag: string, progress: InstallProgress) => {
      if (progressModuleName === moduleName && progressVersionTag === versionTag) {
        progressCallback(progress)
      }
    }

    ipcRenderer.on('modules:installProgress', handleProgress)
    try {
      await invoke<void>('modules:installVersion', moduleName, versionTag)
      await new Promise(resolve => setTimeout(resolve, 500)) // wait for the last progress callback
    } finally {
      ipcRenderer.off('modules:installProgress', handleProgress)
    }
  },
  async uninstallVersion (moduleName: ModuleName, versionTag: string): Promise<void> {
    await invoke<void>('modules:uninstallVersion', moduleName, versionTag)
  },
  async getConfig<T = ModuleConfig> (moduleName: ModuleName): Promise<T> {
    return await invoke<T>('modules:getConfig', moduleName)
  },
  async setConfig<T = ModuleConfig> (moduleName: ModuleName, config: T): Promise<void> {
    await invoke<void>('modules:setConfig', moduleName, config)
  }
}
contextBridge.exposeInMainWorld('modulesAPI', modulesAPI)

const executionEngineAPI = {
  async startModule (): Promise<void> {
    await invoke<void>('executionEngine:startModule')
  },
  async stopModule (): Promise<void> {
    await invoke<void>('executionEngine:stopModule')
  },
  async getState (): Promise<ExecutionEngineState> {
    return await invoke<ExecutionEngineState>('executionEngine:getState')
  },
  async setModuleToRun (module?: ModuleName): Promise<void> {
    await invoke<void>('executionEngine:setModuleToRun', module)
  },
  async listenForExecutionLog (callback: RendererListener<ExecutionLogEntry>): Promise<void> {
    await startListening('executionEngine:listenForExecutionLog', 'executionEngine:executionLog', callback)
  },
  async stopListeningForExecutionLog (callback: RendererListener<ExecutionLogEntry>): Promise<void> {
    await stopListening('executionEngine:stopListeningForExecutionLog', 'executionEngine:executionLog', callback)
  },
  async listenForStdOut (callback: RendererListener<string>): Promise<void> {
    await startListening('executionEngine:listenForStdOut', 'executionEngine:stdout', callback)
  },
  async stopListeningForStdOut (callback: RendererListener<string>): Promise<void> {
    await stopListening('executionEngine:stopListeningForStdOut', 'executionEngine:stdout', callback)
  },
  async listenForStdErr (callback: RendererListener<string>): Promise<void> {
    await startListening('executionEngine:listenForStdErr', 'executionEngine:stderr', callback)
  },
  async stopListeningForStdErr (callback: RendererListener<string>): Promise<void> {
    await stopListening('executionEngine:stopListeningForStdErr', 'executionEngine:stderr', callback)
  },
  async listenForStatistics (callback: RendererListener<ModuleExecutionStatisticsEventData>): Promise<void> {
    await startListening('executionEngine:listenForStatistics', 'executionEngine:statistics', callback)
  },
  async stopListeningForStatistics (callback: RendererListener<ModuleExecutionStatisticsEventData>): Promise<void> {
    await stopListening('executionEngine:stopListeningForStatistics', 'executionEngine:statistics', callback)
  },
  async deleteStatistics (): Promise<void> {
    await invoke<void>('executionEngine:deleteStatistics')
  }
}
contextBridge.exposeInMainWorld('executionEngineAPI', executionEngineAPI)

const topAPI = {
  async getWeeklyTop (): Promise<TopData> {
    return await invoke<TopData>('top:getWeeklyTop')
  }
}
contextBridge.exposeInMainWorld('topAPI', topAPI)

const settingsAPI = {
  async get (): Promise<SettingsData> {
    return await invoke<SettingsData>('settings:get')
  },
  async deleteData (): Promise<void> {
    await invoke<void>('settings:deleteData')
  },
  system: {
    async setAutoUpdate (data: SettingsData['system']['autoUpdate']): Promise<void> {
      await invoke<void>('settings:system:autoUpdate', data)
    },
    async setHideInTray (data: SettingsData['system']['hideInTray']): Promise<void> {
      await invoke<void>('settings:system:hideInTray', data)
    },
    async setStartOnBoot (data: SettingsData['system']['startOnBoot']): Promise<void> {
      await invoke<void>('settings:system:startOnBoot', data)
    },
    async setLanguage (data: SettingsData['system']['language']): Promise<void> {
      await invoke<void>('settings:system:language', data)
    }
  },
  modules: {
    async setDataPath (data: SettingsData['modules']['dataPath']): Promise<void> {
      await invoke<void>('settings:modules:dataPath', data)
    },
    async promptForDataPath (): Promise<void> {
      await invoke<void>('settings:modules:promptForDataPath')
    },
    async openDataFolder (): Promise<void> {
      await invoke<void>('settings:modules:openDataFolder')
    },
    async deleteData (): Promise<void> {
      await invoke<void>('settings:modules:deleteData')
    }
  },
  itarmy: {
    async setUUID (data: SettingsData['itarmy']['uuid']): Promise<void> {
      await invoke<void>('settings:itarmy:uuid', data)
    },
    async setAPIKey (data: SettingsData['itarmy']['apiKey']): Promise<void> {
      await invoke<void>('settings:itarmy:apiKey', data)
    }
  },
  bootstrap: {
    async setStep (data: SettingsData['bootstrap']['step']): Promise<void> {
      await invoke<void>('settings:bootstrap:step', data)
    },
    async setSelectedModulesConfig (data: SettingsData['bootstrap']['selectedModulesConfig']): Promise<void> {
      await invoke<void>('settings:bootstrap:selectedModulesConfig', data)
    }
  },
  schedule: {
    async setEnabled (data: SettingsData['schedule']['enabled']): Promise<void> {
      await invoke<void>('settings:schedule:enabled', data)
    },
    async setStartTime (data: SettingsData['schedule']['startTime']): Promise<void> {
      await invoke<void>('settings:schedule:startTime', data)
    },
    async setEndTime (data: SettingsData['schedule']['endTime']): Promise<void> {
      await invoke<void>('settings:schedule:endTime', data)
    },
    async setModules (data: SettingsData['schedule']['modules']): Promise<void> {
      await invoke<void>('settings:schedule:modules', data)
    },
    async setIntervals (data: SettingsData['schedule']['intervals']): Promise<void> {
      await invoke<void>('settings:schedule:intervals', data)
    }
  },
  gui: {
    async setTheme (data: SettingsData['gui']['theme']): Promise<void> {
      await invoke<void>('settings:gui:theme', data)
    },
    async setMode (data: SettingsData['gui']['mode']): Promise<void> {
      await invoke<void>('settings:gui:mode', data)
    },
    async setUnlockedModes (data: SettingsData['gui']['unlockedModes']): Promise<void> {
      await invoke<void>('settings:gui:unlockedModes', data)
    }
  }
}
contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)

const developersAPI = {
  async getContributors (): Promise<Contributor[]> {
    return await invoke<Contributor[]>('developers:getContributors')
  }
}
contextBridge.exposeInMainWorld('developersAPI', developersAPI)

const activenessAPI = {
  async isLoggedIn (): Promise<boolean> {
    return await invoke<boolean>('activeness:isLoggedIn')
  },
  async login (email: string, password: string): Promise<boolean> {
    return await invoke<boolean>('activeness:login', email, password)
  },
  async logout (): Promise<void> {
    await invoke<void>('activeness:logout')
  },
  async getTasksList (): Promise<GetActivenessTasksListResponse> {
    return await invoke<GetActivenessTasksListResponse>('activeness:getTasksList')
  },
  async makeTaskDone (id: number): Promise<MakeActivenessTaskDoneResponse> {
    return await invoke<MakeActivenessTaskDoneResponse>('activeness:makeTaskDone', id)
  },
  async ignoreTask (id: number): Promise<IgnoreActivenessTaskResponse> {
    return await invoke<IgnoreActivenessTaskResponse>('activeness:ignoreTask', id)
  },
  async getStats (): Promise<GetActivenessStatsResponse> {
    return await invoke<GetActivenessStatsResponse>('activeness:getStats')
  },
  async getMyStats (): Promise<{ score: number }> {
    return await invoke<{ score: number }>('activeness:getMyStats')
  }
}
contextBridge.exposeInMainWorld('activenessAPI', activenessAPI)

const itArmyAPI = {
  async getStats (): Promise<GetITArmyUserStatsResponse> {
    return await invoke<GetITArmyUserStatsResponse>('itarmy:getStats')
  }
}
contextBridge.exposeInMainWorld('itArmyAPI', itArmyAPI)

export interface SystemUsage {
  cpuPercent: number
  ramPercent: number
}

const systemAPI = {
  async getUsage (): Promise<SystemUsage> {
    return await invoke<SystemUsage>('system:getUsage')
  }
}
contextBridge.exposeInMainWorld('systemAPI', systemAPI)

const helpersAPI = {
  async openURLInBrowser (url: string): Promise<void> {
    await invoke<void>('helpers:openURLInBrowser', url)
  },
  async logRendererEvent (event: string, details?: unknown): Promise<void> {
    await invoke<void>('helpers:logRendererEvent', event, details)
  },
  async openProfileFolder (): Promise<void> {
    await invoke<void>('helpers:openProfileFolder')
  },
  async openStabilityLog (): Promise<void> {
    await invoke<void>('helpers:openStabilityLog')
  }
}
contextBridge.exposeInMainWorld('helpersAPI', helpersAPI)

declare global {
  interface Window {
    modulesAPI: typeof modulesAPI
    executionEngineAPI: typeof executionEngineAPI
    topAPI: typeof topAPI
    settingsAPI: typeof settingsAPI
    developersAPI: typeof developersAPI
    activenessAPI: typeof activenessAPI
    itArmyAPI: typeof itArmyAPI
    systemAPI: typeof systemAPI
    helpersAPI: typeof helpersAPI
  }
}
