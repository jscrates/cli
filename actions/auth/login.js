// @ts-check

import Spinner from 'mico-spinner'
import api from '../../lib/api/index.js'
import { promptCredentials } from '../../utils/prompts/index.js'
import { logError, logSuccess } from '../../utils/loggers.js'

function login(config) {
  return async function () {
    const spinner = Spinner('Authenticating')

    try {
      const auth = config.get('auth')

      if (auth && auth.token) {
        return logSuccess('You are already authenticated.')
      }

      const { email, password } = await promptCredentials()

      spinner.start()

      const {
        data: { data: loginData },
      } = await api.put('/auth/login', { email, password })

      config.set('auth.token', loginData?.token)

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
