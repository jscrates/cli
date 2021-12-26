// @ts-check

import { createReadStream, existsSync, mkdirSync, readFileSync } from 'fs'
import kebabCase from 'lodash.kebabcase'
import Spinner from 'mico-spinner'
import FormData from 'form-data'
import tempDirectory from 'temp-dir'
import { globby } from 'globby'
import chalk from 'chalk'
import tar from 'tar'
import api from '../lib/api.js'

//? The tarball created in the process will be placed in the
//? OS's temp directory.
// TODO: Shall we clean this directory post publishing?
const TEMP_TAR_DIR = `${tempDirectory}/jscrates-tars/${Date.now()}`

const createTempTarDirIfNotExists = () => {
  try {
    if (!existsSync(TEMP_TAR_DIR)) {
      return mkdirSync(TEMP_TAR_DIR, { recursive: true })
    }
  } catch (error) {}
}

/**
 * Action to publish a package to JSCrates repository.
 */
async function publishPackage() {
  const spinner = Spinner('Publishing package')

  try {
    spinner.start()

    createTempTarDirIfNotExists()

    //? The `package-meta.json` file is entry for an project.
    //? The publish process revolves around this file.
    const packageMetaFile = 'package.json'

    //? Absence of `package-meta.json` indicates that project
    //? has not been initialized and hence cannot be published.
    if (!existsSync(packageMetaFile)) {
      console.error(
        chalk.red(
          `Current workspace is not a ${chalk.bold('JSCrates')} project.`
        ),
        chalk.blue(
          `\n\nForgot to initialize the project? Try executing \`jscrates init\``
        )
      )

      return process.exit(1)
    }

    //? We can now read & parse the `package-meta.json`
    //? to store the package meta in-memory.
    const packageMeta = JSON.parse(
      readFileSync(packageMetaFile, { encoding: 'utf-8' })
    )

    //* Here we respect the `.gitignore` to ignore the directories
    //* and files that are not required for this current project's runtime.
    // TODO: In future, we might allow a `.jscratesignore` file as well.
    const files = await globby(['**/*.{js,json}', '!package-lock.json'], {
      gitignore: true,
    })

    //? We need this for cases where package name is using the scoped syntax.
    //? Example: @jscrates/cli should become jscrates-cli
    const kebabCasedPackageName = kebabCase(packageMeta.name)

    const tarOpts = {
      //* We will follow the same tarball naming convention that NPM uses.
      //* Example: @jscrates/cli → jscrates-cli-1.0.0.tgz
      file: `${TEMP_TAR_DIR}/${kebabCasedPackageName}-${packageMeta.version}.tgz`,
    }

    //? Create the tarball by including the files after respecting
    //? ignored files & directories.
    tar.create(tarOpts, files)

    const formData = new FormData()

    formData.append('packageTarball', createReadStream(tarOpts.file))
    formData.append('packageMeta', createReadStream(packageMetaFile))

    const { data } = await api.post('/pkg/publish', formData, {
      headers: { ...formData.getHeaders() },
    })

    console.log(chalk.green(data?.message))
    spinner.succeed()
    return
  } catch (error) {
    if (error?.isAxiosError) {
      const { error: apiError } = error.response.data
      console.log(chalk.red(apiError))
      spinner.fail()
      return
    }

    console.error(chalk.red(error))
    spinner.fail()
    return
  }
}

export default publishPackage
