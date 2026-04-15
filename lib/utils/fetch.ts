import type { RequestInit } from 'undici-types'

export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000

export function withRequestTimeout (init: RequestInit = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS): RequestInit {
  return {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(timeoutMs)
  }
}
