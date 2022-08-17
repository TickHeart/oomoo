import { log } from 'console'
import path from 'path'
import chalk from 'chalk'
import chokidar from 'chokidar'
import fg from 'fast-glob'
import { execaCommand } from 'execa'
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
    if (!config.collect && pathSet.has(pathDir)) {
      pathSet.delete(pathDir)
      return
    }
    if (/__MACOSX/.test(pathDir)) {
      await execaCommand(['rm', '-rf', '__MACOSX'].join(' '), { encoding: 'utf-8', cwd: config.watchDir })
      return
    }

    if (event === 'add' && isImageFile(pathDir))
      await operationPicture(pathDir, config)
    else if (event === 'add' && isZip(pathDir))
      await decompressZip(pathDir, config)
  })
}

async function decompressZip(pathDir: string, config: Options) {
  log(chalk.yellow('zip:') + pathDir)
  await execaCommand(['unzip', pathDir].join(' '), { encoding: 'utf-8', cwd: config.watchDir })
  await execaCommand(['rm -rf', pathDir].join(' '), { encoding: 'utf-8', cwd: config.watchDir })
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
  log(chalk.green('file:') + filePath)
  const { isOk } = havePath(destPath)
  if (model === 'move') {
    if (overwriteOriginalFile) {
      await execaCommand(['mv', filePath, destPath, '-f'].join(' '), { encoding: 'utf-8', cwd: config.watchDir })
    }
    else {
      if (!isOk)
        await execaCommand(['mv', filePath, destPath].join(' '), { encoding: 'utf-8', cwd: config.watchDir })
    }
  }
  else if (model === 'copy') {
    if (overwriteOriginalFile) { await execaCommand(['cp -R', filePath, destPath].join(' '), { encoding: 'utf-8', cwd: config.watchDir }) }
    else {
      if (!isOk)
        await execaCommand(['cp -R', filePath, destPath].join(' '), { encoding: 'utf-8', cwd: config.watchDir })
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

