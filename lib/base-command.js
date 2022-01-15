// @ts-check

import { Command } from 'commander'

export default class BaseCommand extends Command {
  constructor(appState) {
    super(appState)
    this.appState = appState
  }

  // To make properties available in all the subcommands.
  // https://github.com/tj/commander.js/issues/1666#issuecomment-1003690872
  createCommand(name) {
    const cmd = new BaseCommand(this.appState)
    cmd.name(name)
    return cmd
  }
}
