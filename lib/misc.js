'use strict'

const fs = require('fs-extra')
const expand = require('expand-template')()
const globby = require('globby')
const path = require('path')
const _ = require('lodash')

module.exports.copyTemplate = function (src, dest, replacer) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, 'utf8')
      .then(content => {
        content = expand(content, replacer || {})
        return fs.writeFile(dest, content)
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}

module.exports.getAllApps = function (root) {
  root = root || process.cwd()
  const pattern = `${root}/**`
  const files = globby.sync(`${pattern}/package.json`, {
    ignore: [`${pattern}/node_modules/**/package.json`]
  })
  const apps = []
  _.each(files, f => {
    try {
      const pkg = require(f)
      if (_.get(pkg, 'dependencies.@rappopo/cuk')) {
        apps.push({
          name: pkg.name,
          path: path.dirname(f)
        })
      }
    } catch (e) {}
  })
  return apps
}
