// @ts-check

import Spinner from 'mico-spinner'
import { loginUser } from '../../lib/api/actions.js'
import { promptCredentials } from '../../utils/prompts/index.js'
import { logError, logSuccess } from '../../utils/loggers.js'

function login(config) {
  return async function (_, command) {
    const store = command.__store
    const spinner = Spinner('Authenticating')

    try {
      if (config.has('auth.token')) {
        logSuccess('You are already authenticated.')
        return process.exit(0)
      }

      if (store.isOnline) {
        logError(`You are not connected to the internet.`)
        return process.exit(1)
      }

      const { email, password } = await promptCredentials()

      spinner.start()

      const response = await loginUser({ email, password })

      config.set('auth.token', response?.token)

      spinner.succeed()
    } catch (error) {
      if (error.hasOwnProperty('isAxiosError')) {
        const { error: apiError } = error.response.data
        spinner.fail()
        return logError(apiError)
      }

      spinner.fail()
      logError(error)
    }
  }
}

export default login
