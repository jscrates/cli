import createPrompt from '../../services/prompt.js'

const CREDS_MIN_LENGTH = 6
const promptSchema = {
  properties: {
    email: {
      description: 'Email',
      required: true,
      format: 'email',
      minLength: CREDS_MIN_LENGTH,
    },
    password: {
      description: 'Password',
      hidden: true,
      replace: '*',
      required: true,
      minLength: CREDS_MIN_LENGTH,
      messages: {
        minLength: 'Password must be atleast 6 characters.',
      },
    },
  },
}

async function promptCredentials() {
  try {
    const prompt = createPrompt()
    return await prompt.get(promptSchema)
  } catch (error) {}
}

export default promptCredentials
