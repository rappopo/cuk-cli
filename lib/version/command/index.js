'use strict'

module.exports = function (vorpal) {
  return {
    description: 'Show program version.',
    alias: 'ver',
    action: function (args, callback) {
      const pkg = require('../../package.json')
      this.log(pkg.version)
      callback()
    }
  }
}
