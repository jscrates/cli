import api from './index.js'

const apiErrorHandler = (error) => {
  if (error.hasOwnProperty('isAxiosError')) {
    const { error: apiError } = error.response.data
    throw apiError
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
