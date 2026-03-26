import { execFileSync, spawn } from 'child_process'
import { Module, Version, InstallProgress, InstallationTarget, BaseConfig, ModuleName } from './module'
import { getCPUArchitecture } from './archLib'
import { convertTrafficValueToBytes } from '../utils/trafficUnits'

export interface Config extends BaseConfig {
  copies: number;
  threads: number;
  useMyIP: number;
}

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_PATTERN = /\u001b\[[0-9;]*m/g

const LINE_SIGNATURES = {
  en: ['traffic', 'connections', 'packets'],
  ua: ['трафік', 'пакети', 'потужність'],
  de: ['verkehr', 'verbindungen', 'pakete']
} as const

const TRAFFIC_LABELS = {
  en: ['traffic'],
  ua: ['трафік'],
  de: ['verkehr']
} as const

const REQUIRED_METRIC_LABELS = {
  en: ['traffic', 'connections', 'packets'],
  ua: ['трафік', 'з\'єднань', 'пакети'],
  de: ['verkehr', 'verbindungen', 'pakete']
} as const

function stripAnsiCodes (value: string): string {
  return value.replace(ANSI_ESCAPE_PATTERN, '')
}

function normalizeForMatch (value: string): string {
  return stripAnsiCodes(value).replace(/\r/g, '').toLocaleLowerCase()
}

function hasLineSignature (line: string, signatures: readonly string[]): boolean {
  return signatures.every((signature) => line.includes(signature))
}

function escapeRegExp (value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractTrafficValue (rawLine: string, labels: readonly string[]): string | null {
  for (const label of labels) {
    const match = rawLine.match(new RegExp(`${escapeRegExp(label)}\\s*:\\s*([^|]+)`, 'i'))
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return null
}

function parseLabeledMetrics (rawLine: string): Map<string, string> {
  const normalizedLine = normalizeForMatch(rawLine)
  const metrics = new Map<string, string>()

  for (const segment of normalizedLine.split(',')) {
    const separatorIndex = segment.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }

    const label = segment.slice(0, separatorIndex).trim()
    const value = segment.slice(separatorIndex + 1).trim()
    if (label !== '' && value !== '') {
      metrics.set(label, value)
    }
  }

  return metrics
}

function hasRequiredMetrics (metrics: Map<string, string>, labels: readonly string[]): boolean {
  return labels.every((label) => metrics.has(label))
}

function removeCustomLanguageArguments (args: string[]): string[] {
  const result: string[] = []

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--lang') {
      index += 1
      continue
    }

    if (arg.startsWith('--lang=')) {
      continue
    }

    result.push(arg)
  }

  return result
}

function resolveModuleLanguage (language: 'en-US' | 'ua-UA' | 'de-DE'): 'en' | 'ua' | 'de' {
  if (language === 'ua-UA') {
    return 'ua'
  }

  if (language === 'de-DE') {
    return 'de'
  }

  return 'en'
}

export class MHDDOSProxy extends Module<Config> {
  private workerMonitorInterval?: ReturnType<typeof setInterval>

  public override get name (): ModuleName { return 'MHDDOS_PROXY' }
  public override get homeURL (): string { return 'https://github.com/porthole-ascend-cinnamon/mhddos_proxy_releases' }
  public override get supportedInstallationTargets (): Array<InstallationTarget> {
    return [
      { arch: 'x64', platform: 'linux' },
      { arch: 'arm64', platform: 'linux' },
      { arch: 'ia32', platform: 'linux' },
      { arch: 'x64', platform: 'win32' },
      { arch: 'ia32', platform: 'win32' }
    ]
  }

  protected override get defaultConfig (): Config {
    return {
      autoUpdate: true,
      executableArguments: [],
      copies: 1,
      threads: 8192,
      useMyIP: 0
    }
  }

  override async getAllVersions (): Promise<Version[]> {
    return await this.loadVersionsFromGithub('porthole-ascend-cinnamon', 'mhddos_proxy_releases')
  }

  private assetMapping = [
    { name: 'mhddos_proxy_linux', arch: 'x64', platform: 'linux' },
    { name: 'mhddos_proxy_linux_arm64', arch: 'arm64', platform: 'linux' },
    { name: 'mhddos_proxy_linux_x86', arch: 'ia32', platform: 'linux' },
    { name: 'mhddos_proxy_win.exe', arch: 'x64', platform: 'win32' },
    { name: 'mhddos_proxy_win_x86.exe', arch: 'ia32', platform: 'win32' }
  ] as Array<{
    name: string;
    arch: 'x64' | 'arm64' | 'ia32';
    platform: 'linux' | 'win32' | 'darwin';
  }>

  override async *installVersion (versionTag: string): AsyncGenerator<InstallProgress, void, void> {
    const progressGenerator = this.installVersionFromGithub('porthole-ascend-cinnamon', 'mhddos_proxy_releases', versionTag, this.assetMapping)

    for await (const progress of progressGenerator) {
      yield progress
    }
  }

  override executableOutputToString (data: Buffer) {
    return data.toString()
  }

  async killProcessesOnWindows (): Promise<void> {
    let filename = 'mhddos_proxy_win.exe'
    for (const asset of this.assetMapping) {
      if (asset.arch === getCPUArchitecture() && asset.platform === process.platform) {
        filename = asset.name
        break
      }
    }

    await new Promise<void>((resolve) => {
      const handler = spawn('taskkill', ['/F', '/T', '/IM', filename], { windowsHide: true })
      const finish = () => resolve()
      handler.once('close', finish)
      handler.once('error', finish)
      handler.once('exit', finish)
    })
  }

  private clearWorkerMonitor () {
    if (this.workerMonitorInterval) {
      clearInterval(this.workerMonitorInterval)
      this.workerMonitorInterval = undefined
    }
  }

  private hasRunningWindowsWorkers (): boolean {
    if (process.platform !== 'win32') {
      return false
    }

    try {
      const output = execFileSync(
        'tasklist',
        ['/FI', 'IMAGENAME eq mhddos_proxy_win.exe', '/FO', 'CSV', '/NH'],
        {
          windowsHide: true,
          encoding: 'utf8'
        }
      )

      return output.trim() !== '' && !output.includes('No tasks are running')
    } catch {
      return false
    }
  }

  protected override shouldIgnoreProcessClose (code: number | null): boolean {
    return code !== null && process.platform === 'win32' && this.hasRunningWindowsWorkers()
  }

  private startWorkerMonitor () {
    if (process.platform !== 'win32') {
      return
    }

    this.clearWorkerMonitor()
    this.workerMonitorInterval = setInterval(() => {
      if (!this.hasRunningWindowsWorkers()) {
        this.clearWorkerMonitor()
        this.clearAutoUpdateInterval()
        if (this.executedProcessHandler !== undefined) {
          this.executedProcessHandler = undefined
          this.emit('execution:stopped', { type: 'execution:stopped', exitCode: 0 })
        }
      }
    }, 1500)
  }

  protected override async stopExecutable (): Promise<void> {
    if (process.platform === 'win32') {
      this.clearWorkerMonitor()
      this.clearAutoUpdateInterval()
      await this.killProcessesOnWindows()
      this.executedProcessHandler = undefined
      return
    }

    await super.stopExecutable()
  }

  override async start (): Promise<void> {
    if (process.platform === 'win32') {
      this.clearWorkerMonitor()
      await this.killProcessesOnWindows()
    }

    const settings = await this.settings.getData()
    const lang = resolveModuleLanguage(settings.system.language)

    const config = await this.getConfig()

    const args: string[] = []
    if (settings.itarmy.uuid !== '') {
      args.push('--user-id', settings.itarmy.uuid)
    }
    args.push('--no-updates')
    if (config.copies !== 0) {
      args.push('--copies', config.copies.toString())
    }
    if (config.copies === 0) {
      args.push('--copies', 'auto')
    }
    if (config.threads > 0) {
      args.push('--threads', config.threads.toString())
    }
    if (config.useMyIP > 0) {
      args.push('--use-my-ip', config.useMyIP.toString())
    }
    args.push('--source', 'itarmykit')
    args.push(...removeCustomLanguageArguments(config.executableArguments.filter((arg) => arg !== '')))
    args.push('--lang', lang)

    let filename = 'mhddos_proxy_linux'
    for (const asset of this.assetMapping) {
      if (asset.arch === getCPUArchitecture() && asset.platform === process.platform) {
        filename = asset.name
        break
      }
    }

    const handler = await this.startExecutable(filename, args)
    if (process.platform === 'win32') {
      this.startWorkerMonitor()
    }

    let lastStatisticsEvent: Date | null = null
    let statisticsBuffer = ''
    handler.stdout.on('data', (data: Buffer) => {
      statisticsBuffer += data.toString()

      const lines = statisticsBuffer.split(/\r?\n/)
      if (/\r?\n$/.test(statisticsBuffer)) {
        statisticsBuffer = ''
      } else {
        statisticsBuffer = lines.pop() as string
      }

      for (const line of lines) {
        try {
          const normalizedLine = normalizeForMatch(line)
          const metrics = parseLabeledMetrics(line)
          if (lang === 'ua') {
            if (!hasLineSignature(normalizedLine, LINE_SIGNATURES.ua) || !hasRequiredMetrics(metrics, REQUIRED_METRIC_LABELS.ua)) {
              continue
            }
          } else if (lang === 'de') {
            if (!hasLineSignature(normalizedLine, LINE_SIGNATURES.de) || !hasRequiredMetrics(metrics, REQUIRED_METRIC_LABELS.de)) {
              continue
            }
          } else if (!hasLineSignature(normalizedLine, LINE_SIGNATURES.en) || !hasRequiredMetrics(metrics, REQUIRED_METRIC_LABELS.en)) {
            continue
          }

          let bytesSend = 0

          const msg = lang === 'ua'
            ? metrics.get(TRAFFIC_LABELS.ua[0]) ?? extractTrafficValue(line, TRAFFIC_LABELS.ua)
            : lang === 'de'
              ? metrics.get(TRAFFIC_LABELS.de[0]) ?? extractTrafficValue(line, TRAFFIC_LABELS.de)
              : metrics.get(TRAFFIC_LABELS.en[0]) ?? extractTrafficValue(line, TRAFFIC_LABELS.en)

          if (!msg) {
            continue
          }

          const currentSendBitrate = convertTrafficValueToBytes(msg)
          if (currentSendBitrate <= 0) {
            continue
          }

          if (lastStatisticsEvent != null) {
            const now = new Date()
            const timeDiff = (now.getTime() - lastStatisticsEvent.getTime()) / 1000.0
            if (timeDiff > 60) {
              lastStatisticsEvent = new Date()
              continue
            }

            if (timeDiff > 0) {
              bytesSend = currentSendBitrate * timeDiff
            }
          }
          lastStatisticsEvent = new Date()

          this.emit('execution:statistics', {
            type: 'execution:statistics',
            bytesSend,
            currentSendBitrate,
            timestamp: new Date().getTime()
          })
        } catch (e) {
          console.error(String(e) + '\n' + line)
        }
      }
    })
  }

  override async stop (): Promise<void> {
    await this.stopExecutable()
  }
}
