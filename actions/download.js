// @ts-check

const http = require('https')
const fs = require('fs')
const Spinner = require('mico-spinner')
const semver = require('semver')

const api = require('../lib/api')
const logError = require('../utils/log-error')

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
    const file = fs.createWriteStream(
      `./tars/${res?.dist?.tarball?.substring(
        res?.dist?.tarball?.lastIndexOf('/') + 1
      )}`
    )

    // Initiate the HTTP request to download package archive
    // (.targz) files from the cloud repository
    http.get(res?.dist?.tarball, function (response) {
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

module.exports = downloadPackage
