'use strict'

const vorpal = require('vorpal')()
const globby = require('globby')
const path = require('path')
const _ = require('lodash')

global.Promise = require('bluebird')
global.cwd = process.cwd()

const dummyAction = (args, callback) => {
  callback()
}

const boot = function (dir) {
  const pattern = `${__dirname}/lib/*/${dir}`
  const files = globby.sync(`${pattern}/*.js`, {
    ignore: [`${pattern}/_*`]
  })
  _.each(files, f => {
    const mod = require(f)(vorpal)
    if (_.isFunction(mod)) {
      mod()
      return
    }
    if (!mod[dir]) {
      let dir = _.last(path.dirname(f).split(path.sep)).toLowerCase()
      let base = path.basename(f, '.js').toLowerCase()
      if (base === 'index') base = ''
      mod[dir] = _.snakeCase(dir + ' ' + base).replace(/_/g, ' ')
    }
    let item = vorpal[dir](mod[dir])
    _.each(['description', 'help', 'alias', 'validate', 'types', 'hidden', 'cancel'], i => {
      if (mod[i]) item[i](mod[i])
    })
    if (dir === 'mode') {
      _.each(['delimiter', 'init'], i => {
        if (mod[i]) item[i](mod[i])
      })
    }
    if (mod.option) {
      _.forOwn(mod.option, (v, k) => {
        if (_.isArray(v)) {
          item.option(k, ...v) // 1: description, 2: autocomplete
        } else {
          item.option(k, v)
        }
      })
    }
    item.action(mod.action || dummyAction)
  })
}

module.exports = function () {
  _.each(['command', 'mode'], item => {
    boot(item)
  })

  vorpal
    .delimiter('cuk!~$')
    .show()
}
