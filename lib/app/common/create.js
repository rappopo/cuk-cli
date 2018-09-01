'use strict'

const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const lib = require('../../misc')
const { exec } = require('promisify-child-process')

module.exports = function (params) {
  let pkgs = _.concat(['@rappopo/cuk'], params.pkgs)
  return new Promise((resolve, reject) => {
    if (fs.existsSync(params.dir)) throw new Error('Project folder already exists!')
    fs.ensureDir(params.dir)
      .then(() => {
        let pkg = {
          name: params.name,
          version: '1.0.0',
          main: 'index.js',
          license: 'MIT'
        }
        if (params.description) pkg.description = params.description
        console.log('Writing package.json...')
        return fs.writeJson(path.join(params.dir, 'package.json'), pkg, {
          spaces: 2
        })
      })
      .then(() => {
        console.log('Copy & merge templates...')
        return Promise.map(['.gitignore', 'index.js'], item => {
          return lib.copyTemplate(
            path.join(__dirname, '..', 'template', item + '.tpl'),
            path.join(params.dir, item)
          )
        })
      })
      .then(() => {
        return fs.ensureDir(path.join(params.dir, 'cuks'))
      })
      .then(() => {
        console.log('Install dependencies...')
        return exec('npm install --save ' + pkgs.join(' '), {
          cwd: params.dir,
          encoding: 'utf8'
        })
      })
      .then(result => {
        let output = []
        _.each(['stderr', 'stdout'], item => {
          result[item] = _.trim(result[item])
          if (!_.isEmpty(result[item])) output = _.concat(output, result[item].split('\n'))
        })
        output = output.map(l => '- npm: ' + l)
        console.log(_.trim(output.join('\n')))
        resolve(true)
      })
      .catch(reject)
  })
}
