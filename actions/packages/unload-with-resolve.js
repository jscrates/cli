// @ts-check

import tar from 'tar'
import chalk from 'chalk'
import https from 'https'
import Spinner from 'mico-spinner'
import tempDirectory from 'temp-dir'
import { createWriteStream, createReadStream } from 'fs'
import validatePackageName from 'validate-npm-package-name'

import upsertDir from '../../utils/upsert-dir.js'
import { getPackages } from '../../lib/api/actions.js'
import { logError, logWarn } from '../../utils/loggers.js'
import DependencyResolver from '../../services/dependency.service.js'

// This is the directory on the OS's temp location where
// crates will be cached to enable offline operations.
const cacheDir = tempDirectory + '/.jscrates-cache'
// Directory in the current project where packages will
// be installed (unzipped). Consider this as `node_modules`
// for JSCrates
const installDir = './jscrates'

let errors = []
const resolver = new DependencyResolver()

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
async function unloadAndResolvePackages(packages, ...args) {
  // Since we are accepting variadic arguments, other arguments can only
  // be accessing by spreading them.
  const store = args[1].appState
  const spinner = Spinner(`Downloading packages`)

  try {
    // Technically, this is where we should check packages in the cache
    // and if they exist, install (unpack) them in the cwd.
    if (!store?.isOnline) {
      return logError('Internet connection is required to download packages.')
    }

    const filteredPackages = packages.filter((pkg) => {
      const validation = validatePackageName(pkg)

      if (validation?.errors?.length) {
        console.group('Package validation errors')
        logError(`"${pkg}" is not a valid package indentifier.`)
        console.groupEnd()
      }

      return validation.validForNewPackages || validation.validForOldPackages
    })

    if (!filteredPackages?.length) {
      spinner.fail()
      return process.exit(1)
    }

    spinner.start()
    await Promise.all(filteredPackages.map(recursiveResolvePackages))
    spinner.succeed()

    if (errors.length) {
      // When only a few packages are resolved, the errors array
      // contains list of packages that were not resolved.
      // We shall display these for better UX.
      console.group(
        logWarn('\nFollowing errors occured during this operation:')
      )
      logError(errors?.join('\n'))
      console.groupEnd()
    }
  } catch (error) {
    spinner.fail()
    return logError(error)
  }
}

/**
 * Recursively resolve provided packages.
 *
 * @param {string} packageNameWithVersion
 */
async function recursiveResolvePackages(packageNameWithVersion) {
  try {
    resolver.add(packageNameWithVersion)

    const response = await getPackages([packageNameWithVersion])

    if (response && response.data && response.data.length) {
      const pkg = response?.data?.[0]

      await downloadPackage(response)

      Object.entries(pkg.dependencies).map((dep) => {
        resolver.setDependency(packageNameWithVersion, dep.join('@'))
        recursiveResolvePackages(dep.join('@'))
      })
    }
  } catch (error) {
    errors.push(error)
    return
  }
}

async function downloadPackage(pkg) {
  pkg?.data?.map((res) => {
    const {
      name,
      dist: { version, tarball },
    } = res

    const timerLabel = chalk.green(`Installed \`${name}@${version}\` in`)
    console.time(timerLabel)

    const tarballFileName = getTarballName(tarball)
    const cacheLocation = upsertDir(generateCacheDirPath(name))
    const installLocation = upsertDir(
      generateCratesInstallDir(`${name}/${version}`)
    )

    // Create a write file stream to download the tar file
    const file = createWriteStream(`${cacheLocation}/${tarballFileName}`)

    // Initiate the HTTP request to download package archive
    // (.tgz) files from the cloud repository
    https.get(tarball, function (response) {
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
}

export default unloadAndResolvePackages
