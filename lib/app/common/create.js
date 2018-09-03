'use strict'

const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const lib = require('../../misc')
const { spawn } = require('promisify-child-process')

const printOut = d => {
  let output = []
  d = _.trim(d.toString())
  if (!_.isEmpty(d)) {
    output = _.concat(output, d.split('\n'))
  }
  output = output.map(l => '- npm: ' + l)
  let out = _.trim(output.join('\n'))
  if (!_.isEmpty(out)) console.log(out)
}

module.exports = function (params) {
  let pkgs = _.concat(['@rappopo/cuk'], params.pkgs)
  return new Promise((resolve, reject) => {
    if (fs.existsSync(params.dir)) throw new Error('Project folder already exists!')
    console.log('\nCreating project folder...')
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
        const args = _.concat(['install', '--save'], pkgs)
        const cp = spawn('npm', args, {
          cwd: params.dir,
          windowsHide: false
        })
        cp.stdout.on('data', printOut)
        cp.stderr.on('data', printOut)
        return cp
      })
      .then(result => {
        resolve(true)
      })
      .catch(reject)
  })
}
