import { ipcMain } from 'electron'

import { ActivenessClient } from '../../lib/activeness/client'
import { FetchLike, LoginResponse } from '../../lib/activeness/api'
import { electronNetFetch } from '../../lib/utils/electronNet'
import { Settings } from './settings'
const activenessFetch: FetchLike = async (input) => await electronNetFetch(input)

class ActivenessHandler {
  readonly client: ActivenessClient
  protected settings: Settings

  constructor (settings: Settings) {
    this.client = new ActivenessClient(activenessFetch)
    this.settings = settings
  }

  async tryLoginFromSettings (): Promise<boolean> {
    const activenessSettings = this.settings.getDataSync().activeness
    const sid = activenessSettings.sid
    if (sid !== undefined) {
      this.client.score = activenessSettings.score
      return await this.client.loginWithSID(sid)
    }

    return false
  }

  async login (email: string, password: string): Promise<LoginResponse> {
    console.log('[activeness] login attempt', { email })
    const response = await this.client.login(email, password)
    console.log('[activeness] login response', response)

    if (response.status === 'ok') {
      await this.settings.setActivenessSID(this.client.sid)
      await this.settings.setActivenessScore(this.client.score)
      console.log('[activeness] session stored', { score: this.client.score })
    }

    return response
  }

  async logout () {
    await this.settings.setActivenessSID(undefined)
    await this.settings.setActivenessScore(0)
    this.client.logout()
  }
}

export function handleActiveness (settings: Settings) {
  const handler = new ActivenessHandler(settings)

  void handler.tryLoginFromSettings()

  ipcMain.handle('activeness:isLoggedIn', async () => {
    return handler.client.isLoggedIn
  })
  ipcMain.handle('activeness:login', async (event, email: string, password: string) => {
    try {
      return await handler.login(email, password)
    } catch (error) {
      console.error('[activeness] login handler failed', error)
      throw error
    }
  })
  ipcMain.handle('activeness:logout', async () => {
    return await handler.logout()
  })

  ipcMain.handle('activeness:getTasksList', async () => {
    const response = await handler.client.getTasksList()
    if (response.status === 'sidcheckfail' || response.status === 'sidexpired') {
      await handler.logout()
    }

    return response
  })

  ipcMain.handle('activeness:makeTaskDone', async (event, taskId: number) => {
    const response = await handler.client.makeTaskDone(taskId)
    if (response.status === 'ok') {
      await settings.setActivenessScore(handler.client.score)
    }
    if (response.status === 'sidcheckfail' || response.status === 'sidexpired') {
      await handler.logout()
    }

    return response
  })

  ipcMain.handle('activeness:ignoreTask', async (event, taskId: number) => {
    const response = await handler.client.ignoreTask(taskId)
    if (response.status === 'sidcheckfail' || response.status === 'sidexpired') {
      await handler.logout()
    }

    return response
  })

  ipcMain.handle('activeness:getStats', async () => {
    return await handler.client.getStats()
  })

  ipcMain.handle('activeness:getMyStats', async () => {
    return { score: handler.client.score }
  })

  return handler
}
