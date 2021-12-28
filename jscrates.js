// @ts-check

import { readFile } from 'fs/promises'
import { Command } from 'commander'
import Configstore from 'configstore'
import checkOnlineStatus from 'is-online'

import { CONFIG_FILE } from './lib/constants.js'
import downloadPackage from './actions/download.js'
import publishPackage from './actions/publish.js'
import login from './actions/auth/login.js'
import register from './actions/auth/register.js'
import logout from './actions/auth/logout.js'

async function jscratesApp() {
  const packageJSON = JSON.parse(await readFile('./package.json', 'utf-8'))
  const isOnline = await checkOnlineStatus()
  const program = new Command()
  const configStore = new Configstore(CONFIG_FILE, {
    createdAt: Date.now(),
  })
  const appState = {
    isOnline,
    configStore,
  }

  program
    .name('jscrates')
    .description(`Welcome to JSCrates 📦, yet another package manager for Node`)
    .version(packageJSON.version, '-v, --version', 'display current version')
    .hook('preAction', (_, actionCommand) => {
      actionCommand['__store'] = appState
    })

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

  await program.parseAsync(process.argv)
}

jscratesApp()
