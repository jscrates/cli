// @ts-check

import https from 'https'
import { createWriteStream, createReadStream } from 'fs'
import Spinner from 'mico-spinner'
import tempDirectory from 'temp-dir'
import chalk from 'chalk'
import tar from 'tar'
import deppy from 'deppy'
import { getPackages } from '../../lib/api/actions.js'
import { logError } from '../../utils/loggers.js'
import upsertDir from '../../utils/upsert-dir.js'
import DependencyResolver from '../../services/dependency.service.js'

// This is the directory on the OS's temp location where
// crates will be cached to enable offline operations.
const cacheDir = tempDirectory + '/.jscrates-cache'
// Directory in the current project where packages will
// be installed (unzipped). Consider this as `node_modules`
// for JSCrates
const installDir = './jscrates'

const resolver = new DependencyResolver()
const depResolver = deppy.create()

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

  try {
    // Technically, this is where we should check packages in the cache
    // and if they exist, install (unpack) them in the cwd.
    if (!store?.isOnline) {
      return logError('Internet connection is required to download packages.')
    }

    const pkgPromises = packages.map(recursiveResolvePackages)

    await Promise.all(pkgPromises)

    packages.map((pkg) => {
      console.log(depResolver.resolve(pkg))
      // console.log(resolver.resolve(pkg))
    })

    // console.log(resolver.servicesList)
  } catch (error) {
    // When all the requested packages could not be resolved
    // API responds with status 404 and list of errors.
    if (Array.isArray(error)) {
      return logError(error.join('\n'))
    }

    return logError(error)
  }
}

/**
 * @param {string} packageNameWithVersion
 */
async function recursiveResolvePackages(packageNameWithVersion) {
  try {
    depResolver(packageNameWithVersion)
    resolver.add(packageNameWithVersion)

    const response = await getPackages([packageNameWithVersion])

    if (response && response.data && response.data.length) {
      const pkg = response?.data?.[0]

      Object.entries(pkg.dependencies).map((dep) => {
        resolver.setDependency(packageNameWithVersion, dep.join('@'))
        depResolver(packageNameWithVersion, [dep])
        recursiveResolvePackages(dep.join('@'))
      })
    }
  } catch (error) {
    console.log(error)
  }
}

export default unloadAndResolvePackages
