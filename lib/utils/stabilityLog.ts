import fs from 'fs'
import path from 'path'

export type StabilityLogLevel = 'info' | 'warn' | 'error'

export interface StabilityLogEntry {
  timestamp: string
  level: StabilityLogLevel
  source: string
  event: string
  message?: string
  details?: unknown
}

export interface StabilityLogWriteOptions {
  filePath?: string
  maxBytes?: number
}

const DEFAULT_MAX_BYTES = 1024 * 1024

function serializeDetails (value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDetails(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, serializeDetails(nestedValue)])
    )
  }

  return value
}

export function getStabilityLogPath () {
  // Lazy-load Electron so the logger can also be used from plain Node smoke scripts.
  const electronModule = require('electron') as { app?: { getPath: (name: string) => string } }
  const appDataPath = electronModule.app?.getPath('appData') ?? process.cwd()
  return path.join(appDataPath, 'ITArmyKitProfile', 'stability.log')
}

function rotateLogIfNeeded (filePath: string, maxBytes: number) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const stats = fs.statSync(filePath)
  if (stats.size < maxBytes) {
    return
  }

  const archivePath = `${filePath}.1`
  fs.rmSync(archivePath, { force: true })
  fs.renameSync(filePath, archivePath)
}

export function writeStabilityLog (entry: Omit<StabilityLogEntry, 'timestamp'>, options: StabilityLogWriteOptions = {}) {
  const filePath = options.filePath ?? getStabilityLogPath()
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const payload: StabilityLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    details: serializeDetails(entry.details)
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  rotateLogIfNeeded(filePath, maxBytes)
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, { encoding: 'utf-8' })
}
