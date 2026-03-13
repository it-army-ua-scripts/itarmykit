import fs from 'fs'
import path from 'path'

export interface AtomicFileWriteOptions {
  targetPath: string
  tempPath?: string
  backupPath?: string
  data: string
  encoding?: 'utf-8' | 'utf8'
}

function resolveTempPath (targetPath: string, tempPath?: string) {
  return tempPath ?? `${targetPath}.tmp`
}

function resolveBackupPath (targetPath: string, backupPath?: string) {
  return backupPath ?? `${targetPath}.bak`
}

export async function writeFileAtomicWithBackup (options: AtomicFileWriteOptions) {
  const targetPath = options.targetPath
  const tempPath = resolveTempPath(targetPath, options.tempPath)
  const backupPath = resolveBackupPath(targetPath, options.backupPath)
  const encoding = options.encoding ?? 'utf-8'

  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.promises.writeFile(tempPath, options.data, { encoding })

  try {
    await fs.promises.rm(backupPath, { force: true })
    await fs.promises.access(targetPath)
    await fs.promises.rename(targetPath, backupPath)
  } catch {
    // Ignore rotation errors when target file does not exist yet.
  }

  await fs.promises.rm(targetPath, { force: true })
  await fs.promises.rename(tempPath, targetPath)
}
