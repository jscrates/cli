// @ts-check

import { Command } from 'commander'
import Configstore from 'configstore'
import { CONFIG_FILE } from './lib/constants.js'
import downloadPackage from './actions/download.js'
import publishPackage from './actions/publish.js'
import login from './actions/auth/login.js'
import register from './actions/auth/register.js'
import logout from './actions/auth/logout.js'

async function jscratesApp() {
  const program = new Command()
  const configStore = new Configstore(CONFIG_FILE, {
    createdAt: Date.now(),
  })

  program
    .name('jscrates')
    .description(`Welcome to JSCrates 📦, yet another package manager for Node`)
    .version(`v2.2.0`, '-v, --version', 'display current version')

  program
    .command('login')
    .description('Login to JSCrates ecosystem')
    .action(login(configStore))

  program
    .command('register')
    .description('Register on the JSCrates ecosystem')
    .action(register(configStore))

  program
    .command('logout')
    .description('Logout from your JSCrates account')
    .action(logout(configStore))

  program
    .command('download')
    .description(`Download a package from official JSCrates registry`)
    .argument('<package name>', 'package to download')
    .argument('[version]', 'version of the package to download')
    .action(downloadPackage)

  program
    .command('publish')
    .description(`Publish your package to JSCrates repository.`)
    .action(publishPackage)

  program.parse(process.argv)
}

jscratesApp()
