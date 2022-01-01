// @ts-check

import { Command } from 'commander'

export default class BaseCommand extends Command {
  constructor(appState) {
    super(appState)
    this.appState = appState
  }
}
