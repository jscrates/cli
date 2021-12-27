// @ts-check

import Spinner from 'mico-spinner'
import api from '../../lib/api.js'
import promptCredentials from '../../utils/prompt-credentials.js'
import { readConfigFile, writeConfig } from '../../utils/config-file.js'
import { logError, logSuccess } from '../../utils/loggers.js'

async function login() {
  const spinner = Spinner('Authenticating')

  try {
    const config = await readConfigFile()

    if (config?.auth) {
      return logSuccess('Heads up! You are already authenticated.')
    }

    const { email, password } = await promptCredentials()

    spinner.start()

    const {
      data: { data: loginData },
    } = await api.put('/auth/login', { email, password })

    await writeConfig({ auth: { token: loginData?.token } })

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

export default login
