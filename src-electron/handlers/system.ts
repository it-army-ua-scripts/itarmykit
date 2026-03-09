import os from 'os'
import { ipcMain } from 'electron'

export interface SystemUsage {
  cpuPercent: number
  ramPercent: number
}

let previousCpuSnapshot = getCpuSnapshot()
let previousCpuPercent = 0

function getCpuSnapshot() {
  const cpus = os.cpus()
  let idle = 0
  let total = 0

  for (const cpu of cpus) {
    idle += cpu.times.idle
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq
  }

  return { idle, total }
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }
  if (value < 0) {
    return 0
  }
  if (value > 100) {
    return 100
  }
  return value
}

function getCpuPercent() {
  const current = getCpuSnapshot()
  const idleDelta = current.idle - previousCpuSnapshot.idle
  const totalDelta = current.total - previousCpuSnapshot.total

  previousCpuSnapshot = current

  if (totalDelta <= 0) {
    return previousCpuPercent
  }

  const usage = (1 - idleDelta / totalDelta) * 100
  previousCpuPercent = roundToOneDecimal(clampPercent(usage))
  return previousCpuPercent
}

function getRamPercent() {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  if (totalMem <= 0) {
    return 0
  }
  const used = ((totalMem - freeMem) / totalMem) * 100
  return roundToOneDecimal(clampPercent(used))
}

export function handleSystem() {
  ipcMain.handle('system:getUsage', async (): Promise<SystemUsage> => {
    return {
      cpuPercent: getCpuPercent(),
      ramPercent: getRamPercent()
    }
  })
}
