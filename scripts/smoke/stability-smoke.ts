import assert from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { writeFileAtomicWithBackup } from '../../lib/utils/atomicFile'
import { ChildProcessLike, ProcessSignal, terminateChildProcess } from '../../lib/utils/processControl'
import { writeStabilityLog } from '../../lib/utils/stabilityLog'

async function testAtomicFileWrite () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'itarmykit-smoke-'))
  const targetPath = path.join(baseDir, 'engine.state.json')
  const backupPath = `${targetPath}.bak`
  const tempPath = `${targetPath}.tmp`

  await writeFileAtomicWithBackup({
    targetPath,
    tempPath,
    backupPath,
    data: JSON.stringify({ version: 1 })
  })

  assert.deepStrictEqual(JSON.parse(await fs.promises.readFile(targetPath, 'utf8')), { version: 1 })
  assert.strictEqual(fs.existsSync(backupPath), false)

  await writeFileAtomicWithBackup({
    targetPath,
    tempPath,
    backupPath,
    data: JSON.stringify({ version: 2 })
  })

  assert.deepStrictEqual(JSON.parse(await fs.promises.readFile(targetPath, 'utf8')), { version: 2 })
  assert.deepStrictEqual(JSON.parse(await fs.promises.readFile(backupPath, 'utf8')), { version: 1 })
}

function createFakeChildProcess (pid: number, onKill?: (signal: ProcessSignal, close: () => void) => void): ChildProcessLike {
  let closeListener: (() => void) | undefined

  return {
    pid,
    once (event, listener) {
      if (event === 'close') {
        closeListener = listener
      }
    },
    kill (signal) {
      onKill?.(signal, () => closeListener?.())
      return true
    }
  }
}

async function testGracefulTerminate () {
  const signals: ProcessSignal[] = []
  let forced = false
  const child = createFakeChildProcess(111, (signal, close) => {
    signals.push(signal)
    if (signal === 'SIGINT') {
      setTimeout(close, 0)
    }
  })

  await terminateChildProcess(child, {
    sigtermDelayMs: 25,
    sigkillDelayMs: 50,
    forceKill: async () => {
      forced = true
    }
  })

  assert.deepStrictEqual(signals, ['SIGINT'])
  assert.strictEqual(forced, false)
}

async function testWindowsForceKillFallback () {
  const signals: ProcessSignal[] = []
  const forced: number[] = []
  const child = createFakeChildProcess(222, (signal) => {
    signals.push(signal)
  })

  await terminateChildProcess(child, {
    platform: 'win32',
    sigtermDelayMs: 10,
    sigkillDelayMs: 20,
    forceKill: async (pid) => {
      forced.push(pid)
    }
  })

  assert.deepStrictEqual(signals, ['SIGINT'])
  assert.deepStrictEqual(forced, [222])
}

async function testPosixKillEscalation () {
  const signals: ProcessSignal[] = []
  const child = createFakeChildProcess(333, (signal) => {
    signals.push(signal)
  })

  await terminateChildProcess(child, {
    platform: 'linux',
    sigtermDelayMs: 10,
    sigkillDelayMs: 20
  })

  assert.deepStrictEqual(signals, ['SIGINT', 'SIGTERM', 'SIGKILL'])
}

async function testStabilityLogWrite () {
  const baseDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'itarmykit-log-smoke-'))
  const logPath = path.join(baseDir, 'stability.log')

  writeStabilityLog({
    level: 'error',
    source: 'smoke',
    event: 'test-entry',
    details: new Error('boom')
  }, { filePath: logPath, maxBytes: 4096 })

  const lines = (await fs.promises.readFile(logPath, 'utf8')).trim().split('\n')
  assert.strictEqual(lines.length, 1)
  const entry = JSON.parse(lines[0]) as { level: string, source: string, event: string, details: { message: string } }
  assert.strictEqual(entry.level, 'error')
  assert.strictEqual(entry.source, 'smoke')
  assert.strictEqual(entry.event, 'test-entry')
  assert.strictEqual(entry.details.message, 'boom')
}

async function main () {
  await testAtomicFileWrite()
  await testStabilityLogWrite()
  await testGracefulTerminate()
  await testWindowsForceKillFallback()
  await testPosixKillEscalation()
  console.log('stability smoke checks passed')
}

void main().catch((error) => {
  console.error('stability smoke checks failed')
  console.error(error)
  process.exitCode = 1
})
