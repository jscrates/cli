// @ts-check

import { existsSync, readFileSync } from 'fs'
import chalk from 'chalk'
import tar from 'tar'
import { globby } from 'globby'
import kebabCase from 'lodash.kebabcase'

/**
 * Action to publish a package to JSCrates repository.
 */
async function publishPackage() {
  try {
    const packageMetaFile = 'package.json'

    if (!existsSync(packageMetaFile)) {
      throw new Error(
        chalk.redBright(`Current workspace is not a JSCrates project.`)
      )
    }

    // Read package-meta.json
    const packageMeta = JSON.parse(
      readFileSync('package.json', { encoding: 'utf-8' })
    )

    const files = await globby(['**/*.{js,json}', '!package-lock.json'], {
      gitignore: true,
    })

    const manifest = {
      name: kebabCase(packageMeta.name),
      version: packageMeta.version,
    }

    const tarOpts = {
      file: `tars/${manifest.name}-${manifest.version}.tgz`,
    }

    tar.create(tarOpts, files).then(function () {
      console.log('TAR has been created!')
    })
  } catch (error) {
    console.log(error)
  }
}

export default publishPackage
