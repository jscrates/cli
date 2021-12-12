// @ts-check

const chalk = require('chalk')

const logError = (...errors) => console.error(chalk.redBright(...errors))

module.exports = logError
