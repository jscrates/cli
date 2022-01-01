#!/usr/bin/env node

import Configstore from 'configstore'
import checkOnlineStatus from 'is-online'

import BaseCommand from './lib/base-command.js'
import { CONFIG_FILE } from './lib/constants.js'
import unloadPackages from './actions/packages/unload.js'
import publishPackage from './actions/publish.js'
import login from './actions/auth/login.js'
import register from './actions/auth/register.js'
import logout from './actions/auth/logout.js'

async function jscratesApp() {
  const isOnline = await checkOnlineStatus()
  const configStore = new Configstore(CONFIG_FILE)
  const program = new BaseCommand({
    isOnline,
    isAuthed: configStore.has('auth.token'),
  })

  program
    .name('jscrates')
    .description(`Welcome to JSCrates 📦, yet another package manager for Node`)
    .version('v2.6.2', '-v, --version', 'Display installed version of JSCrates')

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
    .command('unload')
    .description('🔽 Download package(s) from the JSCrates registry')
    .argument('<packages...>', 'List of packages delimited by a space')
    .action(unloadPackages)
    .addHelpText(
      'after',
      '\nExamples:\n jscrates unload bodmas' +
        '\n jscrates unload physics-formulae@1.0.0' +
        '\n jscrates unload binary-search merge-sort bodmas@1.0.0'
    )
    .aliases(['u'])

  program
    .command('publish')
    .description(`Publish your package to JSCrates repository.`)
    .action(publishPackage)

  await program.parseAsync(process.argv)
}

jscratesApp()
