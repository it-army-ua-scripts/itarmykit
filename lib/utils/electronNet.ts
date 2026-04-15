import fs from 'fs'
import { net } from 'electron'
import type { ClientRequest } from 'electron/main'

export interface ElectronNetResponse {
  status: number
  statusText: string
  ok: boolean
  headers: {
    get: (name: string) => string | null
  }
  text: () => Promise<string>
  json: <T = unknown>() => Promise<T>
  arrayBuffer: () => Promise<ArrayBuffer>
}

export const DEFAULT_ELECTRON_REQUEST_TIMEOUT_MS = 30_000

function createTimeout (request: ClientRequest, timeoutMs: number) {
  return setTimeout(() => {
    request.destroy(new Error(`Request timed out after ${timeoutMs}ms`))
  }, timeoutMs)
}

export async function electronNetFetch (input: string, timeoutMs = DEFAULT_ELECTRON_REQUEST_TIMEOUT_MS): Promise<ElectronNetResponse> {
  return await new Promise<ElectronNetResponse>((resolve, reject) => {
    const request = net.request(input)
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timeoutHandle)
      callback()
    }

    const timeoutHandle = createTimeout(request, timeoutMs)

    request.on('response', (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })
      response.on('end', () => {
        const body = Buffer.concat(chunks)
        const headers = response.headers
        finish(() => {
          resolve({
            status: response.statusCode,
            statusText: response.statusMessage,
            ok: response.statusCode >= 200 && response.statusCode < 300,
            headers: {
              get (name: string) {
                const value = headers[name.toLowerCase()]
                if (Array.isArray(value)) {
                  return value[0] ?? null
                }
                return value ?? null
              }
            },
            async text () {
              return body.toString('utf-8')
            },
            async json<T = unknown> () {
              return JSON.parse(body.toString('utf-8')) as T
            },
            async arrayBuffer () {
              return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
            }
          })
        })
      })
      response.on('error', (error) => {
        finish(() => reject(error))
      })
    })

    request.on('error', (error) => {
      finish(() => reject(error))
    })

    request.end()
  })
}

export async function electronNetDownloadFile (
  input: string,
  outPath: string,
  onProgress?: (progress: number) => void,
  timeoutMs = DEFAULT_ELECTRON_REQUEST_TIMEOUT_MS
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = net.request(input)
    const fileStream = fs.createWriteStream(outPath)
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timeoutHandle)
      callback()
    }

    const cleanup = async () => {
      fileStream.destroy()
      try {
        await fs.promises.rm(outPath, { force: true })
      } catch {
        // ignore cleanup errors
      }
    }

    const timeoutHandle = createTimeout(request, timeoutMs)

    request.on('response', (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        const chunks: Buffer[] = []
        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })
        response.on('end', async () => {
          const body = Buffer.concat(chunks).toString('utf-8')
          await cleanup()
          finish(() => reject(new Error(`Download failed: ${response.statusCode} ${response.statusMessage}. ${body}`)))
        })
        response.on('error', async (error) => {
          await cleanup()
          finish(() => reject(error))
        })
        return
      }

      const contentLengthHeader = response.headers['content-length']
      const contentLengthRaw = Array.isArray(contentLengthHeader) ? contentLengthHeader[0] : contentLengthHeader
      const contentLength = contentLengthRaw == null ? undefined : parseInt(contentLengthRaw, 10)
      let downloadedBytes = 0

      if (onProgress) {
        onProgress(0.001)
      }

      response.on('data', (chunk) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        downloadedBytes += buffer.length
        fileStream.write(buffer)
        if (onProgress && contentLength && contentLength > 0) {
          onProgress(downloadedBytes / contentLength * 100)
        }
      })

      response.on('end', () => {
        fileStream.end(() => {
          finish(() => resolve())
        })
      })

      response.on('error', async (error) => {
        await cleanup()
        finish(() => reject(error))
      })
    })

    request.on('error', async (error) => {
      await cleanup()
      finish(() => reject(error))
    })

    fileStream.on('error', async (error) => {
      request.destroy(error)
      await cleanup()
      finish(() => reject(error))
    })

    request.end()
  })
}
