// @ts-check

import https from 'https'
import { createWriteStream, createReadStream } from 'fs'
import Spinner from 'mico-spinner'
import tempDirectory from 'temp-dir'
import chalk from 'chalk'
import tar from 'tar'
import { getPackages } from '../../lib/api/actions.js'
import { logError } from '../../utils/loggers.js'
import upsertDir from '../../utils/upsert-dir.js'

// This is the directory on the OS's temp location where
// crates will be cached to enable offline operations.
const cacheDir = tempDirectory + '/.jscrates-cache'
// Directory in the current project where packages will
// be installed (unzipped). Consider this as `node_modules`
// for JSCrates
const installDir = './jscrates'

// Generates directory path suffixed with the package name.
const suffixPackageName = (baseDir, packageName) => baseDir + '/' + packageName

// Used for storing packages in cache.
const generateCacheDirPath = (packageName = '') =>
  suffixPackageName(cacheDir, packageName)

// Used for unzipping packages in the CWD.
const generateCratesInstallDir = (packageName = '') =>
  suffixPackageName(installDir, packageName)

// Extracts tarball name from the provided URL.
const getTarballName = (tarballURL) => {
  return tarballURL.substring(tarballURL.lastIndexOf('/') + 1)
}

/**
 * Action to download packages from repository.
 *
 * TODO: Implement logic to check packages in cache before
 * requesting the API.
 *
 * @param {string[]} packages
 */
async function unloadPackages(packages, ...args) {
  // Since we are accepting variadic arguments, other arguments can only
  // be accessing by spreading them.
  const store = args[1].__store
  const spinner = Spinner(`Downloading packages`)

  try {
    if (!store?.isOnline) {
      return logError('Internet connection is required to download packages.')
    }

    spinner.start()

    const response = await getPackages(packages)

    // `data` contains all the resolved packages metadata.
    // 1. Download the tarball to cache directory.
    // 2. Read the cached tarball & install in CWD.
    response?.data?.map((res) => {
      const timerLabel = chalk.green(`Installed \`${res.name}\` in`)
      console.time(timerLabel)

      const tarballFileName = getTarballName(res?.dist?.tarball)
      const cacheLocation = upsertDir(generateCacheDirPath(res?.name))
      const installLocation = upsertDir(
        generateCratesInstallDir(`${res?.name}/${res?.dist?.version}`)
      )

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

      console.timeEnd(timerLabel)
    })

    console.log('\n')

    // When only a few packages are resolved, the errors array
    // contains list of packages that were not resolved.
    // We shall display these for better UX.
    console.group(
      chalk.yellow('The following errors occured during this operation:')
    )

    if (response?.errors?.length) {
      logError(response?.errors?.join('\n'))
    }

    console.groupEnd()

    console.log('\n')

    spinner.succeed()
  } catch (error) {
    spinner.fail()

    // When all the requested packages could not be resolved
    // API responds with status 404 and list of errors.
    if (Array.isArray(error)) {
      return logError(error.join('\n'))
    }

    return logError(error)
  }
}

export default unloadPackages
