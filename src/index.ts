import { log } from 'console'
import path from 'path'
import chalk from 'chalk'
import chokidar from 'chokidar'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { resolveConfig } from './config'

export async function oomoo() {
  const config = await resolveConfig()

  if (!config) {
    log(chalk.red('请先写入oomoorc配置文件 .oomoorc'))
    return
  }

  chokidar.watch(config.watchDir, {
  }).on('all', async (event, pathDir) => {
    if (event === 'add' && isImageFile(pathDir))
      await moveImg(pathDir, config)
  })
}

async function moveImg(pathDir: string, config: {
  skipVersionTesting: boolean
  watchDir: string
  toDir: string
}) {
  const { filename } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filename',
      default: path.basename(pathDir),
      message: '请输入文件名',
    },
  ])
  await copyFileSync(pathDir, config.toDir, filename)
}

async function copyFileSync(filePath: string, destDir: string, filename: string) {
  return await fs.copy(filePath, path.join(destDir, filename))
}

export function getExtName(pathDir: string) {
  return path.extname(pathDir).slice(1)
}

export function isImageFile(pathDir: string) {
  const fileExtname = getExtName(pathDir)
  const supportFiles = ['webp', 'jpeg', 'png']
  return supportFiles.includes(fileExtname)
}

