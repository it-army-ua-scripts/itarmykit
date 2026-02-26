import { ModuleName } from 'app/lib/module/module'
import { ExecutionEngine } from './engine'
import { Settings, ScheduleInterval } from './settings'

function parseTime(time: string): number | null {
  const parts = time.split(':')
  if (parts.length !== 2) {
    return null
  }

  const hours = Number(parts[0])
  const minutes = Number(parts[1])
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  return hours * 60 + minutes
}

function isWithinTimeWindow(nowMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes === endMinutes) {
    return true
  }
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes
}

function getPreviousWeekDay(day: number): number {
  return day === 0 ? 6 : day - 1
}

function isIntervalActive(now: Date, interval: ScheduleInterval): boolean {
  if (process.platform === 'darwin' && interval.module === 'MHDDOS_PROXY') {
    return false
  }

  const startMinutes = parseTime(interval.startTime)
  const endMinutes = parseTime(interval.endTime)
  if (startMinutes === null || endMinutes === null) {
    return false
  }

  const days = Array.isArray(interval.days) ? interval.days : []
  if (days.length === 0) {
    return false
  }

  const day = now.getDay()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  if (startMinutes === endMinutes) {
    return days.includes(day)
  }
  if (startMinutes < endMinutes) {
    return days.includes(day) && isWithinTimeWindow(nowMinutes, startMinutes, endMinutes)
  }

  if (days.includes(day) && nowMinutes >= startMinutes) {
    return true
  }
  const previousDay = getPreviousWeekDay(day)
  return days.includes(previousDay) && nowMinutes < endMinutes
}

export function handleSchedule(settings: Settings, executionEngine: ExecutionEngine) {
  const reconcile = async () => {
    const settingsData = await settings.getData()
    if (settingsData.bootstrap.step !== 'DONE') {
      return
    }

    if (!settingsData.schedule.enabled) {
      return
    }

    const now = new Date()
    const activeIntervals = settingsData.schedule.intervals.filter((interval) => isIntervalActive(now, interval))
    const shouldRun = activeIntervals.length > 0

    const state = await executionEngine.getState()
    if (!shouldRun) {
      if (state.run) {
        await executionEngine.stopModule()
      }
      return
    }

    const activeModules = activeIntervals.map((interval) => interval.module as ModuleName)
    const moduleToRun = activeModules.includes((state.moduleToRun || '') as ModuleName)
      ? state.moduleToRun as ModuleName
      : activeModules[0]

    if (state.moduleToRun !== moduleToRun) {
      if (state.run) {
        await executionEngine.stopModule()
      }
      await executionEngine.setModuleToRun(moduleToRun)
    }

    const updatedState = await executionEngine.getState()
    if (!updatedState.run) {
      await executionEngine.startModule()
    }
  }

  let running = false
  const runReconcile = async () => {
    if (running) {
      return
    }
    running = true
    try {
      await reconcile()
    } catch (err) {
      console.warn('[Schedule] Failed to reconcile state', err)
    } finally {
      running = false
    }
  }

  settings.onSettingsChanged(() => {
    void runReconcile()
  })

  void runReconcile()
  setInterval(() => {
    void runReconcile()
  }, 15000)
}
