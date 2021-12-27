// @ts-check

import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { CONFIG_FILE } from '../lib/constants.js'
import { logError } from '../utils/loggers.js'

export const configFileExists = () => existsSync(CONFIG_FILE)

export async function createConfigFileIfNotExists(initialConfig = {}) {
  try {
    if (configFileExists()) return
    await writeFile(
      CONFIG_FILE,
      JSON.stringify(initialConfig, null, 2),
      'utf-8'
    )
    return
  } catch (error) {
    logError(error)
    return process.exit(1)
  }
}

export async function readConfigFile() {
  try {
    if (!configFileExists()) return
    const configFile = await readFile(CONFIG_FILE)
    return JSON.parse(configFile.toString('utf-8'))
  } catch (error) {
    // JSON.parse() could not parse the contents of
    // file which indicates it might be corrupted.
    // TODO: Figure out what to do in this case.
    if (error instanceof SyntaxError) {
      logError('The config file seems to be corrupt.')
      return process.exit(1)
    }
  }
}

export async function writeConfig(config) {
  try {
    const currentConfig = await readConfigFile()
    const updatedConfig = Object.assign(
      {},
      { updatedAt: Date.now(), ...currentConfig, ...config }
    )

    await writeFile(
      CONFIG_FILE,
      JSON.stringify(updatedConfig, null, 2),
      'utf-8'
    )
    return
  } catch (error) {
    logError(error)
    return process.exit(1)
  }
}
