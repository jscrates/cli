// @ts-check

const axios = require('axios').default

const api = axios.create({ baseURL: 'https://shipcrates.herokuapp.com' })

module.exports = api
