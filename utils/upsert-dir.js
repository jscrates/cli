import { existsSync, mkdirSync } from 'fs'
import { logError } from './loggers.js'

/**
 * Creates a directory if it does not exist.
 *
 * @param {string} pathLike
 * @param {import('fs').MakeDirectoryOptions} opts
 */
const upsertDir = (pathLike, opts = {}) => {
  try {
    if (!existsSync(pathLike)) {
      mkdirSync(pathLike, { recursive: true, ...opts })
    }

    return pathLike
  } catch (error) {
    logError(error)
    return process.exit(1)
  }
}

export default upsertDir
