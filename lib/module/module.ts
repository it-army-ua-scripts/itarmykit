import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { EventEmitter } from 'events'
import { Readable } from 'stream'
import type { ReadableStream as WebReadableStream } from 'stream/web'
import path from 'path'
import fs from 'fs'
import decompress from 'decompress'
import { Settings } from '../../src-electron/handlers/settings'
import { getCPUArchitecture } from './archLib'
import { writeFileAtomicWithBackup } from '../utils/atomicFile'
import { terminateChildProcess } from '../utils/processControl'
import { writeStabilityLog } from '../utils/stabilityLog'

export type ModuleName = 'DISTRESS' | 'MHDDOS_PROXY'

export interface Version {
  tag: string;
  name: string;
  body: string;
  installed: boolean;
}

export enum InstallationErrorCodes {
  OK = 'OK',
  UNSUPPORTED_PLATFORM = 'UNSUPPORTED_PLATFORM',
  CANT_FIND_ASSET = 'CANT_FIND_ASSET',
  UNKNOWN = 'UNKNOWN'
}

export type InstallationProgressStage = 'DOWNLOADING' | 'EXTRACTING' | 'VALIDATING' | 'DONE' | 'FAILED'

export interface InstallProgress {
  stage: InstallationProgressStage;
  progress: number;
  errorCode?: InstallationErrorCodes
  errorMessage?: string;
}

export interface InstallationTarget {
  arch: 'x64' | 'arm64' | 'ia32';
  platform: 'linux' | 'win32' | 'darwin';
}

export interface BaseConfig {
  autoUpdate: boolean;
  selectedVersion?: string;
  executableArguments: string[];
}

export type ModuleExecutionEvent = 'execution:statistics' | 'execution:stdout' | 'execution:stderr' | 'execution:error' | 'execution:started' | 'execution:stopped'
export interface ModuleExecutionStatisticsEventData {
  type: 'execution:statistics';
  currentSendBitrate: number
  bytesSend: number
  timestamp: number
}
export interface ModuleExecutionStdoutEventData {
  type: 'execution:stdout';
  data: string;
}
export interface ModuleExecutionStderrEventData {
  type: 'execution:stderr';
  data: string;
}
export interface ModuleExecutionErrorEventData {
  type: 'execution:error';
  error: Error;
}
export interface ModuleExecutionStartedEventData {
  type: 'execution:started';
}
export interface ModuleExecutionStoppedEventData {
  type: 'execution:stopped';
  exitCode: number | null;
}
export type ModuleExecutionEventData = ModuleExecutionStatisticsEventData | ModuleExecutionStdoutEventData | ModuleExecutionStderrEventData | ModuleExecutionErrorEventData | ModuleExecutionStartedEventData | ModuleExecutionStoppedEventData

export abstract class Module<ConfigType extends BaseConfig> {
  public abstract get name(): ModuleName
  public abstract get homeURL(): string
  public abstract get supportedInstallationTargets(): Array<InstallationTarget>

  public async getConfig (): Promise<ConfigType> {
    if (this._config === undefined) {
      await this.loadConfig()
    }
    if (this._config === undefined) {
      this._config = this.defaultConfig
      await this.saveConfig(this._config)
    }
    return this._config
  }

  public async setConfig (config: ConfigType): Promise<void> {
    this._config = config
    await this.saveConfig(this._config)
  }

  protected settings: Settings
  private _config?: ConfigType
  protected abstract get defaultConfig(): ConfigType

  private autoupdateInterval?: ReturnType<typeof setInterval>

  protected async getInstallationDirectory () {
    const settingsData = await this.settings.getData()
    return path.join(settingsData.modules.dataPath, this.name)
  }

  protected async getCacheDirectory () {
    const settingsData = await this.settings.getData()
    const location = path.join(settingsData.modules.dataPath, 'cache')
    await fs.promises.mkdir(location, { recursive: true })
    return location
  }

  constructor (settings: Settings) {
    this.settings = settings
  }

  abstract start(): Promise<void>
  abstract stop(): Promise<void>

  abstract getAllVersions(): Promise<Version[]>
  abstract installVersion(versionTag: string): AsyncGenerator<InstallProgress, void, void>

  public async uninstallVersion (versionTag: string): Promise<void> {
    const installDirectory = await this.getInstallationDirectory()
    await fs.promises.rm(path.join(installDirectory, versionTag), { recursive: true, force: true })
  }

  public async installLatestVersion (): Promise<boolean> {
    const versions = await this.getAllVersions()
    if (versions.length > 0 && !versions[0].installed) {
      const progressGenerator = this.installVersion(versions[0].tag)
      for await (const progress of progressGenerator) {
        if (progress.stage === 'DONE') {
          const config = await this.getConfig()
          config.selectedVersion = versions[0].tag
          await this.setConfig(config)
          return true
        }
      }
    }
    return false
  }

  protected async *installVersionFromGithub (owner: string, repo: string, tag: string, assetMapping: Array<{ name: string, arch: 'x64' | 'arm64' | 'ia32', platform: 'linux' | 'win32' | 'darwin' }>): AsyncGenerator<InstallProgress, void, void> {
    interface GithubRelease {
      assets: Array<{ name: string, browser_download_url: string }>
    }

    let release: GithubRelease
    try {
      console.log(`Fetching github release: https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`)
      const releaseResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`)
      if (releaseResponse.status !== 200) {
        yield { stage: 'FAILED', progress: 0, errorCode: InstallationErrorCodes.UNKNOWN, errorMessage: `Cant fetch github release: ${await releaseResponse.text()}` }
        return
      }

      release = await releaseResponse.json() as GithubRelease
    } catch (err) {
      yield { stage: 'FAILED', progress: 0, errorCode: InstallationErrorCodes.UNKNOWN, errorMessage: `Cant fetch github release: ${err}` }
      return
    }

    const assetName = assetMapping.find((asset) => asset.platform === process.platform && asset.arch === getCPUArchitecture())?.name
    if (assetName === undefined) {
      yield { stage: 'FAILED', progress: 0, errorCode: InstallationErrorCodes.UNSUPPORTED_PLATFORM, errorMessage: `Tour architecture is "${getCPUArchitecture()}" and platform "${process.platform}" which is not supported.` }
      return
    }

    const asset = release.assets.find((releaseAsset) => releaseAsset.name === assetName)
    if (asset === undefined) {
      yield { stage: 'FAILED', progress: 0, errorCode: InstallationErrorCodes.CANT_FIND_ASSET, errorMessage: `Cant find asset with name "${assetName}" in github release` }
      return
    }

    const installDirectory = await this.getInstallationDirectory()
    const cacheDirectory = await this.getCacheDirectory()
    const tempDownoloadPath = path.join(cacheDirectory, assetName)

    try {
      for await (const progress of this.downloadFile(asset.browser_download_url, tempDownoloadPath)) {
        yield { stage: 'DOWNLOADING', progress: progress.progress }
      }
    } catch (err) {
      yield { stage: 'FAILED', progress: 0, errorCode: InstallationErrorCodes.UNKNOWN, errorMessage: `Cant download release asset file: ${err}` }
      return
    }

    yield { stage: 'EXTRACTING', progress: 0 }
    try {
      await this.extractArchive(tempDownoloadPath, path.join(installDirectory, tag))
    } catch (err) {
      yield { stage: 'FAILED', progress: 0, errorCode: InstallationErrorCodes.UNKNOWN, errorMessage: `Cant extract archive: ${err}` }
      return
    }

    yield { stage: 'VALIDATING', progress: 0 }
    yield { stage: 'DONE', progress: 0 }
  }

  private githubReleaseCache = [] as { tag_name: string, name: string, body: string }[]
  private githubReleaseCacheTime?: Date
  protected async loadVersionsFromGithub (owner: string, repo: string): Promise<Version[]> {
    const installDirectory = await this.getInstallationDirectory()

    const isVersionInstalled = async (tagName: string) => {
      return await new Promise<boolean>((resolve) => {
        fs.promises.access(path.join(installDirectory, tagName))
          .then(() => resolve(true))
          .catch(() => resolve(false))
      })
    }

    const now = Date.now()
    const cacheTtlMs = 5 * 60 * 1000
    if (this.githubReleaseCacheTime === undefined || this.githubReleaseCacheTime.getTime() + cacheTtlMs < now) {
      console.debug('[Module] Refreshing GitHub releases cache', { owner, repo })
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`)
      if (response.status !== 200) {
        throw new Error(`Cant fetch github releases: ${await response.text()}`)
      }
      let newReleasesList = await response.json() as Array<{ tag_name: string, name: string, body: string, prerelease: boolean, draft: boolean }>
      newReleasesList = newReleasesList.filter((release) => !release.prerelease && !release.draft)
      this.githubReleaseCache = newReleasesList
      this.githubReleaseCacheTime = new Date()
    } else {
      console.debug('[Module] Using cached GitHub releases', { owner, repo })
    }

    return await Promise.all(this.githubReleaseCache.map(async (release) => {
      return {
        tag: release.tag_name,
        name: release.name,
        body: release.body,
        installed: await isVersionInstalled(release.tag_name)
      }
    }))
  }

  protected async *downloadFile (url: string, outPath: string): AsyncGenerator<{ progress: number }, void, void> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    const fileStream = fs.createWriteStream(outPath)
    const contentLengthHeader = response.headers.get('content-length')
    if (contentLengthHeader == null) {
      throw new Error('Content length is null')
    }
    const contentLength = parseInt(contentLengthHeader, 10)
    let downloadedBytes = 0

    yield { progress: 0.001 }

    if (response.body == null) {
      throw new Error('Response body is null')
    }
    const body = Readable.fromWeb(response.body as unknown as WebReadableStream)
    body.pipe(fileStream)

    const eventEmitter = new EventEmitter()

    body.on('data', (chunk) => {
      downloadedBytes += chunk.length
      eventEmitter.emit('progress', downloadedBytes / contentLength * 100)
    })

    body.on('error', (err: unknown) => {
      eventEmitter.emit('err', err)
    })

    let lastYieldProgress = 0
    while (true) {
      const result = await new Promise<{ progress: number }>((resolve, reject) => {
        eventEmitter.on('progress', (progress: number) => {
          eventEmitter.removeAllListeners()
          resolve({ progress })
        })

        eventEmitter.on('err', (err: unknown) => {
          eventEmitter.removeAllListeners()
          reject(err)
        })
      })
      if (result.progress === 100) {
        await new Promise<void>((resolve, reject) => {
          fileStream.on('finish', resolve)
          fileStream.on('error', reject)
        })
        return
      }
      if (lastYieldProgress + 5 < result.progress || result.progress === 100) {
        lastYieldProgress = result.progress
        yield result
      }
    }
  }

  protected async extractArchive (archivePath: string, outPath: string, deleteSource = true): Promise<void> {
    try {
      const directoryExist = await new Promise<boolean>((resolve) => {
        fs.promises.access(outPath)
          .then(() => resolve(true))
          .catch(() => resolve(false))
      })
      if (!directoryExist) {
        await fs.promises.mkdir(outPath, { recursive: true })
      }

      if (archivePath.endsWith('.zip') || archivePath.endsWith('.tar.gz')) {
        await decompress(archivePath, outPath)
      } else {
        await fs.promises.copyFile(archivePath, path.join(outPath, path.basename(archivePath)))
        if (process.platform !== 'win32') {
          await fs.promises.chmod(path.join(outPath, path.basename(archivePath)), '775')
        }
      }
    } finally {
      if (deleteSource) {
        try {
          await fs.promises.unlink(archivePath)
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }

  private executionEventEmitter = new EventEmitter()
  public on (event: ModuleExecutionEvent, listener: (data: ModuleExecutionEventData) => void) {
    this.executionEventEmitter.on(event, listener)
  }

  public once (event: ModuleExecutionEvent, listener: (data: ModuleExecutionEventData) => void) {
    this.executionEventEmitter.once(event, listener)
  }

  public off (event: ModuleExecutionEvent, listener: (data: ModuleExecutionEventData) => void) {
    this.executionEventEmitter.off(event, listener)
  }

  protected emit (event: ModuleExecutionEvent, data: ModuleExecutionEventData) {
    this.executionEventEmitter.emit(event, data)
  }

  public get isRunning (): boolean {
    return this.executedProcessHandler !== undefined
  }

  protected executedProcessHandler?: ChildProcessWithoutNullStreams

  protected executableOutputToString (data: Buffer) {
    return data.toString()
  }

  protected clearAutoUpdateInterval () {
    if (this.autoupdateInterval) {
      clearInterval(this.autoupdateInterval)
      this.autoupdateInterval = undefined
    }
  }

  protected shouldIgnoreProcessClose (code: number | null): boolean {
    void code
    return false
  }

  protected async startExecutable (executableName: string, args: string[]): Promise<ChildProcessWithoutNullStreams> {
    let config = await this.getConfig()
    if (config.autoUpdate) {
      await this.installLatestVersion()
      config = await this.getConfig()
    }

    const installDirectory = await this.getInstallationDirectory()

    if (config.selectedVersion === undefined) {
      const error = new Error('Failed to start executable. No version selected')
      writeStabilityLog({ level: 'error', source: `module:${this.name}`, event: 'process-error', details: error })
      this.emit('execution:error', { type: 'execution:error', error })
      throw error
    }

    if (this.executedProcessHandler !== undefined) {
      throw new Error('Already running')
    }

    const executablePath = path.join(installDirectory, config.selectedVersion, executableName)
    const cwd = path.join(installDirectory, config.selectedVersion)

    await fs.promises.access(executablePath, fs.constants.F_OK)

    this.autoupdateInterval = setInterval(() => {
      void (async () => {
        try {
          const updateConfig = await this.getConfig()
          if (updateConfig.autoUpdate && await this.installLatestVersion() && this.isRunning) {
            await this.stop()
            await this.start()
          }
        } catch (error) {
          console.warn(`[Module:${this.name}] Auto-update cycle failed`, error)
          writeStabilityLog({ level: 'error', source: 'module:' + this.name, event: 'auto-update-cycle-failed', details: error })
        }
      })()
    }, 1000 * 60 * 30)

    writeStabilityLog({
      level: 'info',
      source: `module:${this.name}`,
      event: 'process-spawn',
      details: { executablePath, args, cwd }
    })

    const spawnedProcess = spawn(executablePath, args, {
      cwd,
      shell: false,
      windowsHide: true
    })
    this.executedProcessHandler = spawnedProcess

    this.emit('execution:started', { type: 'execution:started' })

    spawnedProcess.stdout.on('data', (data: Buffer) => {
      this.emit('execution:stdout', { type: 'execution:stdout', data: this.executableOutputToString(data) })
    })
    spawnedProcess.stderr.on('data', (data: Buffer) => {
      this.emit('execution:stderr', { type: 'execution:stderr', data: this.executableOutputToString(data) })
    })
    spawnedProcess.on('error', (error: Error) => {
      this.clearAutoUpdateInterval()
      if (this.executedProcessHandler === spawnedProcess) {
        this.executedProcessHandler = undefined
      }
      writeStabilityLog({ level: 'error', source: `module:${this.name}`, event: 'process-error', details: error })
      this.emit('execution:error', { type: 'execution:error', error })
    })
    spawnedProcess.on('close', (code: number | null) => {
      if (this.shouldIgnoreProcessClose(code)) {
        writeStabilityLog({
          level: 'info',
          source: `module:${this.name}`,
          event: 'process-close-ignored',
          details: { exitCode: code }
        })
        return
      }

      this.clearAutoUpdateInterval()
      if (this.executedProcessHandler === spawnedProcess) {
        this.executedProcessHandler = undefined
      }
      writeStabilityLog({ level: code === 0 ? 'info' : 'warn', source: `module:${this.name}`, event: 'process-close', details: { exitCode: code } })
      this.emit('execution:stopped', { type: 'execution:stopped', exitCode: code })
    })

    return spawnedProcess
  }

  protected async stopExecutable (): Promise<void> {
    this.clearAutoUpdateInterval()

    const handler = this.executedProcessHandler
    if (!handler) {
      return
    }

    writeStabilityLog({ level: 'info', source: `module:${this.name}`, event: 'process-stop-requested', details: { pid: handler.pid } })
    await terminateChildProcess(handler)

    if (this.executedProcessHandler === handler) {
      this.executedProcessHandler = undefined
    }
  }

  protected async loadConfig (): Promise<void> {
    const installDirectory = await this.getInstallationDirectory()
    const configFilePath = path.join(installDirectory, 'config.json')
    try {
      const configDump = await fs.promises.readFile(configFilePath, { encoding: 'utf-8' })
      const config = JSON.parse(configDump) as ConfigType
      this._config = {
        ...this.defaultConfig,
        ...config
      }
    } catch {
      this._config = undefined
    }
  }

  protected async saveConfig (config: ConfigType): Promise<void> {
    const installDirectory = await this.getInstallationDirectory()
    const configDump = JSON.stringify(config)
    const configFilePath = path.join(installDirectory, 'config.json')
    const tempConfigFilePath = `${configFilePath}.tmp`

    await fs.promises.mkdir(installDirectory, { recursive: true })
    await writeFileAtomicWithBackup({
      targetPath: configFilePath,
      tempPath: tempConfigFilePath,
      data: configDump,
      encoding: 'utf-8'
    })
  }
}
