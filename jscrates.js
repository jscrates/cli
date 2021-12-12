// @ts-check

const { Command } = require('commander')

const downloadPackage = require('./actions/download')
const { version } = require('./package.json')

const program = new Command()

program
  .name('jscrates')
  .description(`Welcome to JSCrates 📦, yet another package manager for Node`)
  .version(`v${version}`, '-v, --version', 'display current version')

program
  .command('download')
  .description(`Download a package from the our registry (Beta)`)
  .argument('<package name>', 'package to download')
  .argument('[version]', 'version of the package to download')
  .action(downloadPackage)

program.parse(process.argv)
