import { resolve } from 'path'
import { readFile } from 'fs/promises'
import ini from 'ini'
import fse from 'fs-extra'

export const DEFAULT_OPTIONS = {
  skipVersionTesting: false,
  watchDir: '',
  toDir: '',
}

export async function resolveConfig() {
  const pircPath = resolveConfigPath()
  if (pircPath) {
    const options = ini.parse(await readFile(pircPath, { encoding: 'utf-8' }))
    return { ...DEFAULT_OPTIONS, ...options }
  }
  else {
    return null
  }
}

const cwd = process.cwd()

function havePath(path: string) {
  const isOk = fse.pathExistsSync(path)
  return { isOk, path }
}

const paths = [havePath(resolve(cwd, '.oomoorc'))]

export function resolveConfigPath() {
  for (const s of paths) {
    if (s.isOk)
      return s.path
  }

  return null
}
