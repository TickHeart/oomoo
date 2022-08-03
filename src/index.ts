import { log } from 'console'
import path from 'path'
import chalk from 'chalk'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import decompress from 'decompress'
import fg from 'fast-glob'
import type { Options } from './config'
import { havePath, resolveConfig } from './config'

const zipFiles = ['zip']
const imgFiles = ['webp', 'jpeg', 'png', 'JPG']

export async function oomoo() {
  const config = await resolveConfig()

  if (!config) {
    log(chalk.red('请先写入oomoorc配置文件 .oomoorc'))
    return
  }
  const paths = await fg([`**/*.{${[...zipFiles, ...imgFiles].join(',')}}`], {
    cwd: config.watchDir,
    absolute: true,
  })
  const pathSet = new Set<string>(paths)

  log(chalk.green('开启监听成功，开始使用吧'))
  chokidar.watch(config.watchDir, {
  }).on('all', async (event, pathDir) => {
    if (!config.collect && pathSet.has(pathDir))
      return

    if (event === 'add' && isImageFile(pathDir))
      await operationPicture(pathDir, config)
    else if (event === 'add' && isZip(pathDir))
      await decompressZip(pathDir, config)
  })
}

async function decompressZip(pathDir: string, config: Options) {
  await decompress(pathDir, config.watchDir)
}

function isZip(pathDir: string) {
  const fileExtname = getExtName(pathDir)
  return zipFiles.includes(fileExtname)
}

async function operationPicture(pathDir: string, config: Options) {
  await copyOrMoveFileSync(pathDir, config, path.basename(pathDir))
}

async function copyOrMoveFileSync(filePath: string, config: Options, filename: string) {
  const { toDir: destDir, model, overwriteOriginalFile } = config
  const destPath = path.join(destDir, filename)
  const { isOk } = havePath(destPath)
  if (model === 'move') {
    if (overwriteOriginalFile) {
      if (isOk)
        await fs.remove(destPath)
      await fs.move(filePath, path.join(destDir, filename))
    }
    else {
      if (!isOk)
        await fs.move(filePath, path.join(destDir, filename))
    }
  }
  else if (model === 'copy') {
    if (overwriteOriginalFile) { await fs.copy(filePath, path.join(destDir, filename)) }
    else {
      if (!isOk)
        await fs.copy(filePath, path.join(destDir, filename))
    }
  }
}

export function getExtName(pathDir: string) {
  return path.extname(pathDir).slice(1)
}

export function isImageFile(pathDir: string) {
  const fileExtname = getExtName(pathDir)

  return imgFiles.includes(fileExtname)
}

oomoo()
