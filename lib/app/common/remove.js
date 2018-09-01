'use strict'

const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const tar = require('tar')
const sprintf = require('sprintf-js').sprintf

module.exports = function (params) {
  return new Promise((resolve, reject) => {
    let src = path.join(process.cwd(), 'package.json')
    if (!fs.existsSync(src)) throw new Error('No package.json found!')
    fs.readJson(src)
      .then(result => {
        if (!_.get(result, 'dependencies.@rappopo/cuk')) {
          if (!params.force) throw new Error('Not a CUK app. Canceled!')
        }
        process.chdir('..')
        if (params.backup) {
          let ts = new Date()
          let dest = path.dirname(src) + sprintf('-%04d%02d%02d%02d%02d%02d.tar.gz', ts.getFullYear(),
            ts.getMonth() + 1, ts.getDate(), ts.getHours(), ts.getMinutes(), ts.getSeconds())
          return tar.c({
            gzip: true,
            file: dest
          }, [path.basename(path.dirname(src))])
        }
        return false
      })
      .then(result => {
        return fs.remove(path.dirname(src))
      })
      .then(() => {
        resolve(true)
      })
      .catch(reject)
  })
}
