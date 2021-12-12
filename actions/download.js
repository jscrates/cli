// @ts-check

import { get } from 'https'
import { createWriteStream } from 'fs'
import Spinner from 'mico-spinner'
import semver from 'semver'

import api from '../lib/api.js'
import logError from '../utils/log-error.js'

/**
 * Action to download packages from repository.
 *
 * @param {string} name
 * @param {string | semver.SemVer} version
 */
async function downloadPackage(name, version) {
  // Initialize a spinner instance
  const downloadingSpinner = Spinner(`Downloading ${name}`)

  try {
    if (version) {
      // Validating version against Semantic Versioning rules
      if (!semver.valid(version)) {
        throw `Invalid version`
      }
    }

    // Initiate the spinner
    downloadingSpinner.start()

    const endpoint = ['pkg', name, version].filter(Boolean).join('/')

    const res = (await api.get(endpoint)).data

    // Create a write file stream to download the tar file
    const file = createWriteStream(
      `./tars/${res?.dist?.tarball?.substring(
        res?.dist?.tarball?.lastIndexOf('/') + 1
      )}`
    )

    // Initiate the HTTP request to download package archive
    // (.targz) files from the cloud repository
    get(res?.dist?.tarball, function (response) {
      response.pipe(file)
    })

    downloadingSpinner.succeed()
  } catch (error) {
    downloadingSpinner.fail()

    if (error?.isAxiosError) {
      return logError(error?.response?.data?.message)
    }

    logError(error)
  }
}

export default downloadPackage
