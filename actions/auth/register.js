import Spinner from 'mico-spinner'
import { registerUser } from '../../lib/api/actions.js'
import { logError, logSuccess } from '../../utils/loggers.js'
import {
  confirmationPrompt,
  promptCredentials,
} from '../../utils/prompts/index.js'

function register(config) {
  const spinner = Spinner('Registering a new user')

  return async function (_, options) {
    try {
      if (options.__store.isAuthed) {
        if (
          !(await confirmationPrompt(
            `It seems like you are already logged in`,
            `\nCreating a new account will log you out of the current account.`,
            `\nDo you want to continue? (y/n)`
          ))
        ) {
          return process.exit(1)
        }

        config.delete('auth.token')
        console.clear()
      }

      const { email, password } = await promptCredentials()

      spinner.start()

      const status = await registerUser({ email, password })

      spinner.succeed()
      return logSuccess(status)
    } catch (error) {
      spinner.fail()
      return logError(error)
    }
  }
}

export default register
