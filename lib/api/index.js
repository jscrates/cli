// @ts-check

import axios from 'axios'

const api = axios.create({ baseURL: 'https://shipcrates.herokuapp.com' })

export default api
