#!/usr/bin/env node

// @ts-check

import { Command } from 'commander'

import downloadPackage from './actions/download.js'
import login from './actions/auth/login.js'
import publishPackage from './actions/publish.js'
import { createConfigFileIfNotExists } from './utils/config-file.js'

createConfigFileIfNotExists({
  createdAt: Date.now(),
})
const program = new Command()

program
  .name('jscrates')
  .description(`Welcome to JSCrates 📦, yet another package manager for Node`)
  .version(`v2.2.0`, '-v, --version', 'display current version')

program.command('login').description('Login to JSCrates').action(login)

program
  .command('download')
  .description(`Download a package from official JSCrates registry`)
  .argument('<package name>', 'package to download')
  .argument('[version]', 'version of the package to download')
  .action(downloadPackage)

program
  .command('publish')
  .description(
    `Publish your package to our repository and make it available for everyone.`
  )
  .action(publishPackage)

program.parse(process.argv)
