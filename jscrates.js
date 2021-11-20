const { Command } = require('commander')
const chalk = require('chalk')
const semver = require('semver')
const fs = require('fs')
const http = require('https')
const Spinner = require('mico-spinner')
const axios = require('axios').default

const { version } = require('./package.json')

const program = new Command()
const api = axios.create({ baseURL: 'https://jscrates-api.herokuapp.com' })

const logError = (...errors) => console.error(chalk.redBright(...errors))

program
  .name('jscrates')
  .description(`Welcome to JSCrates 📦, yet another package manager for Node`)
  .version(`v${version}`, '-v, --version', 'display current version')

program
  .command('download')
  .description(`Download a package from the our registry (Beta)`)
  .argument('<package name>', 'package to download')
  .argument('[version]', 'version of the package to download')
  .action(async (packageName, packageVersion) => {
    // Initialize a spinner instance
    const downloadingSpinner = Spinner(`Downloading ${packageName}`)

    try {
      if (packageVersion) {
        // Validating version against Semantic Versioning rules
        if (!semver.valid(packageVersion)) {
          throw `Invalid version`
        }
      }

      // Initiate the spinner
      downloadingSpinner.start()

      const endpoint = ['pkg', packageName, packageVersion]
        .filter(Boolean)
        .join('/')

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
  })

program.parse(process.argv)
