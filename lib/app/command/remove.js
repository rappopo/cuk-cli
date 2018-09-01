'use strict'

const fn = require('../common/remove')

module.exports = function (vorpal) {
  return {
    description: 'Remove/destroy in-path application',
    command: 'app remove',
    alias: 'destroy',
    action: args => {
      let me = vorpal.activeCommand
      return new Promise((resolve, reject) => {
        me.prompt([
          {
            type: 'confirm',
            name: 'backup',
            message: 'Backup project folder before remove ? '
          }, {
            type: 'confirm',
            name: 'force',
            default: false,
            message: 'Force remove application even though it\'s not a CUK app? '
          }, {
            type: 'confirm',
            name: 'proceed',
            default: false,
            message: 'Are you sure to proceed ? '
          }
        ])
          .then(result => {
            return result.proceed ? fn(result) : false
          })
          .then(result => {
            me.log('\n' + (result ? 'App successfully removed!' : 'Command canceled!'))
            resolve(true)
          })
          .catch(err => {
            me.log('\nError:', err.message)
            resolve(true)
          })
      })
    }
  }
}
