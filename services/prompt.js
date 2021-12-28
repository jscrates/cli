import prompt from 'prompt'

export default function createPrompt(message = '', delimiter = ' →') {
  try {
    prompt.start()
    prompt.message = message
    prompt.delimiter = delimiter
    return prompt
  } catch (error) {
    console.log(error)
  }
}
