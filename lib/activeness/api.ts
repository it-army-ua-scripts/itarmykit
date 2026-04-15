import { withRequestTimeout } from '../utils/fetch'
import type { RequestInit } from 'undici-types'

const BASE_URL = 'https://activeness.social/api'
const BASE_REQUEST_OPTIONS = withRequestTimeout()

export interface FetchResponseLike {
  status: number
  text: () => Promise<string>
  json: <T = unknown>() => Promise<T>
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<FetchResponseLike>

export type SID = string

export interface LoginRequest {
    email: string
    password: string
}
export interface PositiveLoginResponse {
    status: 'ok'
    score: number
    sid: SID
}
export interface NegativeLoginResponse {
    status: 'err'
    errorType: 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
    errorMessage: string
}
export type LoginResponse = PositiveLoginResponse | NegativeLoginResponse

export async function login (params: LoginRequest, fetchImpl: FetchLike = fetch): Promise<LoginResponse> {
  try {
    const loginResponse = await fetchImpl(`${BASE_URL}/?job=auth&ver=1&email=${encodeURI(params.email)}&psw=${encodeURI(params.password)}`, BASE_REQUEST_OPTIONS)
    if (loginResponse.status !== 200) {
      return {
        status: 'err',
        errorType: 'BAD_STATUS_CODE',
        errorMessage: `Bad status code: ${loginResponse.status}`
      }
    }

    const responseJSON = await loginResponse.json() as LoginResponse
    if (responseJSON.status !== 'ok') {
      return {
        status: 'err',
        errorType: 'ERR_FROM_BACKEND',
        errorMessage: responseJSON.status
      }
    }

    return responseJSON
  } catch (err) {
    return {
      status: 'err',
      errorType: 'REQUEST_FAILED',
      errorMessage: String(err)
    }
  }
}

export interface Task {
    id: number
    link: string
    whattodo: string
    message: string
    priority: boolean
}
export interface GetTasksListRequest {
    sid: SID
}
export interface GetTasksListPositiveResponse {
    status: 'ok'
    list: Task[]
}
export interface GetTasksListNegativeResponse {
    status: 'err' | 'sidexpired' | 'sidcheckfail'
    errorType: 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
    errorMessage: string
}
export type GetTasksListResponse = GetTasksListPositiveResponse | GetTasksListNegativeResponse

export async function getTasksList (params: GetTasksListRequest, fetchImpl: FetchLike = fetch): Promise<GetTasksListResponse> {
  try {
    const tasksListResponse = await fetchImpl(`${BASE_URL}/?job=list&sid=${encodeURI(params.sid)}`, BASE_REQUEST_OPTIONS)
    if (tasksListResponse.status !== 200) {
      return {
        status: 'err',
        errorType: 'BAD_STATUS_CODE',
        errorMessage: `Bad status code: ${tasksListResponse.status}`
      }
    }

    const responseJSON = await tasksListResponse.json() as GetTasksListResponse
    if (responseJSON.status !== 'ok') {
      let message = 'Unknown error'
      switch (responseJSON.status) {
        case 'sidexpired':
          message = 'SID expired'
          break
        case 'sidcheckfail':
          message = 'SID doesnt belong to login/account'
          break
      }

      return {
        status: responseJSON.status,
        errorType: 'ERR_FROM_BACKEND',
        errorMessage: message
      }
    }

    return responseJSON
  } catch (err) {
    return {
      status: 'err',
      errorType: 'REQUEST_FAILED',
      errorMessage: String(err)
    }
  }
}

export interface MakeTaskDoneRequest {
    sid: SID
    id: number
}
export interface MakeTaskDonePositiveResponse {
    status: 'ok'
}
export interface MakeTaskDoneNegativeResponse {
    status: 'err' | 'sidexpired' | 'sidcheckfail' | 'clicktoofast' | 'id_check_fails' | `err#${string}`
    errorType: 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
    errorMessage: string
}
export type MakeTaskDoneResponse = MakeTaskDonePositiveResponse | MakeTaskDoneNegativeResponse

export async function makeTaskDone (params: MakeTaskDoneRequest, fetchImpl: FetchLike = fetch): Promise<MakeTaskDoneResponse> {
  try {
    const taskDoneResponse = await fetchImpl(`${BASE_URL}/?job=done&sid=${encodeURI(params.sid)}&id=${encodeURI(String(params.id))}`, BASE_REQUEST_OPTIONS)
    if (taskDoneResponse.status !== 200) {
      return {
        status: 'err',
        errorType: 'BAD_STATUS_CODE',
        errorMessage: `Bad status code: ${taskDoneResponse.status}`
      }
    }

    const responseJSON = await taskDoneResponse.json() as MakeTaskDoneResponse
    if (responseJSON.status !== 'ok') {
      let message = responseJSON.status
      switch (responseJSON.status) {
        case 'sidexpired':
          message = 'SID expired'
          break
        case 'sidcheckfail':
          message = 'SID doesnt belong to login/account'
          break
        case 'clicktoofast':
          message = 'You are clicking too fast'
          break
        case 'id_check_fails':
          message = 'Task id is invalid'
          break
      }

      return {
        status: responseJSON.status,
        errorType: 'ERR_FROM_BACKEND',
        errorMessage: message
      }
    }

    return responseJSON
  } catch (err) {
    return {
      status: 'err',
      errorType: 'REQUEST_FAILED',
      errorMessage: String(err)
    }
  }
}

export interface IgnoreTaskRequest {
    sid: SID
    id: number
}
export interface IgnoreTaskPositiveResponse {
    status: 'ok'
}
export interface IgnoreTaskNegativeResponse {
    status: 'err' | 'sidexpired' | 'sidcheckfail' | 'id_check_fails' | `err#${string}`
    errorType: 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
    errorMessage: string
}
export type IgnoreTaskResponse = IgnoreTaskPositiveResponse | IgnoreTaskNegativeResponse

export async function ignoreTask (params: IgnoreTaskRequest, fetchImpl: FetchLike = fetch): Promise<IgnoreTaskResponse> {
  try {
    const ignoreTaskResponse = await fetchImpl(`${BASE_URL}/?job=ignore&sid=${encodeURI(params.sid)}&id=${encodeURI(String(params.id))}`, BASE_REQUEST_OPTIONS)
    if (ignoreTaskResponse.status !== 200) {
      return {
        status: 'err',
        errorType: 'BAD_STATUS_CODE',
        errorMessage: `Bad status code: ${ignoreTaskResponse.status}`
      }
    }

    const responseJSON = await ignoreTaskResponse.json() as IgnoreTaskResponse
    if (responseJSON.status !== 'ok') {
      let message = responseJSON.status
      switch (responseJSON.status) {
        case 'sidexpired':
          message = 'SID expired'
          break
        case 'sidcheckfail':
          message = 'SID doesnt belong to login/account'
          break
        case 'id_check_fails':
          message = 'Task id is invalid'
          break
      }

      return {
        status: responseJSON.status,
        errorType: 'ERR_FROM_BACKEND',
        errorMessage: message
      }
    }

    return responseJSON
  } catch (err) {
    return {
      status: 'err',
      errorType: 'REQUEST_FAILED',
      errorMessage: String(err)
    }
  }
}

export interface UserStat {
    name: string
    score: number
}
export interface Stats {
    latest: UserStat[]
    top10: UserStat[]
    suggested: UserStat[]
}
export interface GetStatsPositiveResponse extends Stats {
    status: 'ok'
}
export interface GetStatsNegativeResponse {
    status: 'err'
    errorType: 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
    errorMessage: string
}
export type GetStatsResponse = GetStatsPositiveResponse | GetStatsNegativeResponse

export async function getStats (fetchImpl: FetchLike = fetch): Promise<GetStatsResponse> {
  try {
    const statsResponse = await fetchImpl(`${BASE_URL}/?job=stats`, BASE_REQUEST_OPTIONS)
    if (statsResponse.status !== 200) {
      return {
        status: 'err',
        errorType: 'BAD_STATUS_CODE',
        errorMessage: `Bad status code: ${statsResponse.status}`
      }
    }

    const responseJSON = await statsResponse.json() as GetStatsResponse
    if (responseJSON.status !== 'ok') {
      return {
        status: 'err',
        errorType: 'ERR_FROM_BACKEND',
        errorMessage: responseJSON.status
      }
    }

    return responseJSON
  } catch (err) {
    return {
      status: 'err',
      errorType: 'REQUEST_FAILED',
      errorMessage: String(err)
    }
  }
}
