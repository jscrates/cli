const { Command } = require('commander')
const cp = require('child_process')
const chalk = require('chalk')
const semver = require('semver')
const fs = require('fs')
const http = require('https')
const Spinner = require('mico-spinner')
const { version } = require('./package.json')

const program = new Command()
const logError = (...errors) => console.error(chalk.redBright(...errors))

program
  .name('jscrates')
  .description(`Welcome to JSCrates 📦, yet another package manager for Node`)
  .version(`v${version}`, '-v, --version', 'display current version')

program
  .command('download')
  .description(`Download a package from the NPM registry (Beta)`)
  .argument('<package name>', 'package to download')
  .argument('[version]', 'version of the package to download')
  .action((packageName, packageVersion) => {
    // Initialize a spinner instance
    const downloadingSpinner = Spinner(`Downloading ${packageName}`)

    try {
      // Build the command
      const packageMetaCommand = ['npm', 'view', '--json']

      if (packageVersion) {
        // Validating version against Semantic Versioning rules
        if (!semver.valid(packageVersion)) {
          throw `Invalid version`
        }

        // If version is valid, push it to the command array
        packageMetaCommand.push(`${packageName}@${packageVersion}`)
      } else {
        // If there is no version, just push the `packageName`
        packageMetaCommand.push(packageName)
      }

      // Initiate the spinner
      downloadingSpinner.start()

      // cp (child process) is responsible to executing
      // shell commands by spawning a process
      cp.exec(packageMetaCommand.join(' '), (err, meta, _) => {
        try {
          if (err) {
            throw err
          }

          // When meta is null, package doesn't
          // exist on the repository
          if (!meta) {
            throw `Package doesn't exists. Please check the version and try again.`
          }

          // Parse the JSON into JavaScript object
          const pkgMeta = JSON.parse(meta)
          // Create a write file stream to download the tar file
          const file = fs.createWriteStream(
            `./tars/${pkgMeta?.dist?.tarball?.substring(
              pkgMeta?.dist?.tarball?.lastIndexOf('/') + 1
            )}`
          )

          // Initiate the HTTP request to download package archive
          // (.targz) files from the cloud repository
          http.get(pkgMeta?.dist?.tarball, function (response) {
            response.pipe(file)
          })

          downloadingSpinner.succeed()
        } catch (error) {
          downloadingSpinner.fail()
          logError(error)
        }
      })
    } catch (error) {
      downloadingSpinner.fail()
      logError(error)
    }
  })

program.parse(process.argv)
