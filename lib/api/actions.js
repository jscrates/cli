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
