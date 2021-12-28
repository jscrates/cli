import chalk from 'chalk'
import createPrompt from '../../services/prompt.js'
import { logError } from '../loggers.js'

export default async function confirmationPrompt(...message) {
  try {
    const prompt = createPrompt()
    const { confirmation } = await prompt.get({
      properties: {
        confirmation: {
          description: chalk.yellow(...message),
          type: 'string',
          required: true,
          enum: ['yes', 'no', 'y', 'n'],
        },
      },
    })

    return confirmation.toLowerCase().startsWith('y') ? true : false
  } catch (error) {
    logError(error)
  }
}
