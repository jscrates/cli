import api from './index.js'

const apiErrorHandler = (error) => {
  if (error.hasOwnProperty('isAxiosError')) {
    const { error: apiError } = error.response.data
    throw apiError
  }
}

const apiAction = async (bodyFn, errorHandlerFn = undefined) => {
  try {
    return await bodyFn()
  } catch (error) {
    return errorHandlerFn ? errorHandlerFn(error) : apiErrorHandler(error)
  }
}

export const registerUser = async ({ email, password }) => {
  try {
    const { data: apiResponse } = await api.post('/auth/register', {
      email,
      password,
    })

    return apiResponse.message
  } catch (error) {
    return apiErrorHandler(error)
  }
}

export const loginUser = async ({ email, password }) => {
  try {
    const {
      data: { data: loginData },
    } = await api.put('/auth/login', { email, password })

    return loginData
  } catch (error) {
    return apiErrorHandler(error)
  }
}

export const getPackages = async (packages) => {
  return await apiAction(
    async () => {
      return (await api.put('/pkg', { packages })).data
    },
    (error) => {
      throw error?.response?.data?.errors
    }
  )
}
