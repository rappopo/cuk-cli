'use strict'

const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const createFn = require('../common/create')

module.exports = function (vorpal) {
  return {
    description: 'Create a new application',
    command: 'app create',
    action: args => {
      let me = vorpal.activeCommand
      return new Promise((resolve, reject) => {
        me.prompt([
          {
            type: 'input',
            name: 'dir',
            message: 'Project folder? ',
            validate: item => {
              if (_.isEmpty(item)) return 'Enter your project folder name. Need to be a non existent folder.'
              let dir = path.resolve(process.cwd(), item)
              if (fs.existsSync(dir)) return 'Folder exists! Please enter a new one'
              return true
            },
            filter: item => {
              return path.resolve(process.cwd(), item)
            }
          }, {
            type: 'input',
            name: 'name',
            message: 'Application name? ',
            default: function (answers) {
              return path.basename(answers.dir)
            },
            validate: item => {
              if (_.isEmpty(item)) return 'Enter your application\'s package name. It will be used as THE package name and follows NPM\'s name rule.'
              return true
            }
          }, {
            type: 'input',
            name: 'description',
            message: 'App description? (optional) '
          }, {
            type: 'checkbox',
            name: 'pkgs',
            message: 'Packages to install ? ',
            choices: [
              { name: 'REST', value: '@rappopo/cuk-rest' },
              { name: 'Route', value: '@rappopo/cuk-route', checked: true },
              { name: 'Static', value: '@rappopo/cuk-static', checked: true }
            ]
          }, {
            type: 'confirm',
            name: 'proceed',
            message: 'Proceed ? '
          }
        ])
          .then(result => {
            result.scope = me
            if (result.proceed) {
              me.log('\nCreating project folder...')
              return createFn(result)
            }
            return false
          })
          .then(result => {
            me.log('\n' + (result ? 'App successfully created!' : 'Command canceled!'))
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
