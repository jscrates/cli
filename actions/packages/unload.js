// @ts-check

import https from 'https'
import { createWriteStream } from 'fs'
import Spinner from 'mico-spinner'
import tempDirectory from 'temp-dir'
import tar from 'tar'
import { getPackages } from '../../lib/api/actions.js'
import { logError } from '../../utils/loggers.js'
import upsertDir from '../../utils/upsert-dir.js'
import { createReadStream } from 'fs'

// This is the directory on the OS's temp location where
// crates will be cached to enable offline operations.
const cacheDir = '.jscrates-cache'
// Directory in the current project where packages will
// be installed (unzipped). Consider this as `node_modules`
// for JSCrates
const installDir = './jscrates'

const generateCacheDirPath = (packageName = '') => {
  return `${tempDirectory}/${cacheDir}/${packageName}`
}

const generateCratesInstallDir = (packageName = '') => {
  return `${installDir}/${packageName}`
}

const getTarballName = (tarballURL) => {
  return tarballURL.substring(tarballURL.lastIndexOf('/') + 1)
}

/**
 * Action to download packages from repository.
 *
 * @param {string[]} packages
 */
async function unloadPackages(packages, ...args) {
  // Since we are accepting variadic arguments, other arguments can only
  // be accessing by spreading them.
  const store = args[1].__store
  const downloadingSpinner = Spinner(`Downloading`)

  try {
    if (!store?.isOnline) {
      return logError('Internet connection is required to download packages.')
    }

    downloadingSpinner.start()

    const response = await getPackages(packages)

    if (response?.errors?.length) {
      logError(response?.errors?.join('\n'))
    }

    response?.data?.map((res) => {
      const tarballFileName = getTarballName(res?.dist?.tarball)
      const cacheLocation = upsertDir(generateCacheDirPath(res?.name))
      const installLocation = upsertDir(generateCratesInstallDir(res?.name))

      // Create a write file stream to download the tar file
      const file = createWriteStream(`${cacheLocation}/${tarballFileName}`)

      // Initiate the HTTP request to download package archive
      // (.tgz) files from the cloud repository
      https.get(res?.dist?.tarball, function (response) {
        response
          .on('error', function () {
            throw 'Something went wrong downloading the package.'
          })
          .on('data', function (data) {
            file.write(data)
          })
          .on('end', function () {
            file.end()
            createReadStream(`${cacheLocation}/${tarballFileName}`).pipe(
              tar.x({ cwd: installLocation })
            )
          })
      })
    })

    downloadingSpinner.succeed()
  } catch (error) {
    downloadingSpinner.fail()

    if (Array.isArray(error)) {
      return logError(error.join('\n'))
    }

    return logError(error)
  }
}

export default unloadPackages
