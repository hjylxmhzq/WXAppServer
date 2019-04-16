let development = require('./development.js')
let production = require('./production.js')

module.exports = {
    development,
    production
}[process.env.NODE_ENV || 'development']
