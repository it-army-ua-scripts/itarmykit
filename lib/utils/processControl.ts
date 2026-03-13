import { spawn } from 'child_process'

export type ProcessSignal = 'SIGINT' | 'SIGTERM' | 'SIGKILL' | number | undefined

export interface ChildProcessLike {
  pid?: number
  once(event: 'close', listener: () => void): void
  kill(signal?: ProcessSignal): boolean
}

export interface TerminateProcessOptions {
  platform?: string
  sigtermDelayMs?: number
  sigkillDelayMs?: number
  forceKill?: (pid: number) => Promise<void>
}

export function buildWindowsTaskkillArgs (pid: number): string[] {
  return ['/PID', String(pid), '/T', '/F']
}

export async function forceKillWindowsProcessTree (pid: number): Promise<void> {
  await new Promise<void>((resolve) => {
    const killer = spawn('taskkill', buildWindowsTaskkillArgs(pid), {
      shell: false,
      windowsHide: true
    })

    const finish = () => resolve()
    killer.once('close', finish)
    killer.once('error', finish)
  })
}

export async function terminateChildProcess (handler: ChildProcessLike, options: TerminateProcessOptions = {}): Promise<void> {
  const platform = options.platform ?? process.platform
  const sigtermDelayMs = options.sigtermDelayMs ?? 5000
  const sigkillDelayMs = options.sigkillDelayMs ?? 10000
  const forceKill = options.forceKill ?? forceKillWindowsProcessTree

  await new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(termTimeout)
      clearTimeout(killTimeout)
      resolve()
    }

    const termTimeout = setTimeout(() => {
      try {
        if (platform === 'win32' && typeof handler.pid === 'number') {
          void forceKill(handler.pid).finally(finish)
          return
        }

        handler.kill('SIGTERM')
      } catch {
        finish()
      }
    }, sigtermDelayMs)

    const killTimeout = setTimeout(() => {
      try {
        if (platform === 'win32' && typeof handler.pid === 'number') {
          void forceKill(handler.pid).finally(finish)
          return
        }

        handler.kill('SIGKILL')
      } catch {
        // ignore kill errors
      }
      finish()
    }, sigkillDelayMs)

    handler.once('close', finish)

    try {
      handler.kill('SIGINT')
    } catch {
      finish()
    }
  })
}
