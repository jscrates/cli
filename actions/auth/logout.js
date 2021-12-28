// Logout module

import chalk from 'chalk'
import createPrompt from '../../services/prompt.js'
import { logSuccess, logWarn } from '../../utils/loggers.js'

export default function logout(config) {
  const prompt = createPrompt()

  return async function (_, options) {
    // There was no user in the first place.
    if (!options.__store.isAuthed) {
      logWarn('You are not logged in.')
      return process.exit(0)
    }

    // It is better to ask for user confirmation before
    // performing a destructive action such as logout.
    const { confirmation } = await prompt.get({
      properties: {
        confirmation: {
          description: chalk.yellow(`Are you sure you want to logout?`),
          type: 'string',
          enum: ['yes', 'no', 'n', 'y'],
          required: true,
        },
      },
    })

    // When user has accepted the confirmation
    if (confirmation.toLowerCase().startsWith('y')) {
      config.delete('auth.token')
      logSuccess('You have successfully logged out.')
      return process.exit(0)
    }

    logWarn('Logout aborted.')
    return process.exit(0)
  }
}
