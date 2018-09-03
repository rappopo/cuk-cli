'use strict'

const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const createFn = require('../common/create')

const pkgs = [
  { name: 'User Authentication', value: '@rappopo/cuk-auth', checked: true },
  { name: 'Bootstrap 4 Skin', value: '@rappopo/cuk-bootstrap' },
  { name: 'Bootswatch Themes for Bootstrap', value: '@rappopo/cuk-bootswatch' },
  { name: 'Development Support', value: '@rappopo/cuk-dev' },
  { name: 'HTTP Layer', value: '@rappopo/cuk-http', checked: true },
  { name: 'Internationalization', value: '@rappopo/cuk-i18n' },
  { name: 'Data Logger', value: '@rappopo/cuk-log' },
  { name: 'Database Model', value: '@rappopo/cuk-model', checked: true },
  { name: 'RESTful Builder', value: '@rappopo/cuk-rest', checked: true },
  { name: 'User Role & Permission', value: '@rappopo/cuk-role', checked: true },
  { name: 'Route Builder', value: '@rappopo/cuk-route', checked: true },
  { name: 'Security Middleware', value: '@rappopo/cuk-security', checked: true },
  { name: 'Session Management', value: '@rappopo/cuk-session', checked: true },
  { name: 'Site Management', value: '@rappopo/cuk-site' },
  { name: 'Static Resources', value: '@rappopo/cuk-static', checked: true },
  { name: 'Task Scheduler', value: '@rappopo/cuk-task', checked: true },
  { name: 'Utility Helpers', value: '@rappopo/cuk-util' },
  { name: 'View Engine', value: '@rappopo/cuk-view', checked: true }
]

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
              return _.kebabCase(path.basename(answers.dir))
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
            type: 'list',
            name: 'type',
            message: 'Application type? ',
            choices: [
              { name: 'RESTful Web Service', value: 'rest' },
              { name: 'Typical Web App', value: 'webapp' },
              { name: 'Custom', value: 'custom', checked: true }
            ]
          }, {
            type: 'checkbox',
            name: 'pkgs',
            message: 'Packages to install ? ',
            choices: pkgs,
            when: answers => {
              return answers.type === 'custom'
            }
          }, {
            type: 'confirm',
            name: 'proceed',
            message: 'Proceed ? '
          }
        ])
          .then(result => {
            result.scope = me
            if (result.proceed) {
              result.pkgs = result.pkgs || []
              if (result.type === 'rest') {
                _.each(['http', 'model', 'rest', 'auth', 'role', 'i18n', 'security'], i => {
                  result.pkgs.push('@rappopo/cuk-' + i)
                })
              } else if (result.type === 'webapp') {
                _.each(['bootstrap', 'bootswatch', 'site', 'route', 'model', 'auth', 'role', 'i18n',
                  'security', 'view', 'util', 'http'], i => {
                  result.pkgs.push('@rappopo/cuk-' + i)
                })
              }
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
