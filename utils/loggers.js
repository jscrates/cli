// @ts-check

import chalk from 'chalk'

export const logError = (...errors) => console.error(chalk.redBright(...errors))
export const logSuccess = (...message) => console.log(chalk.green(...message))
export const logInfo = (...message) => console.log(chalk.blue(...message))
export const logWarn = (...message) => console.log(chalk.yellow(...message))
