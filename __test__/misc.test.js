'use strict'

const misc = require('../lib/misc')
const path = require('path')
const fs = require('fs-extra')

describe('copyTemplate', () => {
  const src = process.cwd() + '/__test__/dummy/copy/src/file.txt'
  const dest = process.cwd() + '/__test__/dummy/copy/dest/file.txt'

  beforeEach(() => {
    fs.emptyDirSync(path.dirname(dest))
  })

  afterAll(() => {
    fs.emptyDirSync(path.dirname(dest))
  })

  test('Destination folder needs to be empty', () => {
    const files = fs.readdirSync(path.dirname(dest))
    expect(files).toHaveLength(0)
  })

  test('File needs to be copied properly with all tokens replaced', () => {
    return new Promise((resolve, reject) => {
      misc.copyTemplate(src, dest, {
        t1: 'token1',
        t2: 'token2'
      })
        .then(() => {
          const files = fs.readdirSync(path.dirname(dest))
          const text = fs.readFileSync(dest, 'utf8')
          expect(files).toHaveLength(1)
          expect(text).toEqual('test token1 token2')
          resolve(true)
        })
    })
  })

  test('Should return as is if no token provided', () => {
    return new Promise((resolve, reject) => {
      misc.copyTemplate(src, dest)
        .then(() => {
          const files = fs.readdirSync(path.dirname(dest))
          const text = fs.readFileSync(dest, 'utf8')
          expect(files).toHaveLength(1)
          expect(text).toEqual('test {t1} {t2}')
          resolve(true)
        })
    })
  })

  test('Should throw error if something happened', () => {
    return expect(misc.copyTemplate('nonexist.file', dest)).rejects.toThrow()
  })
})

describe('getAllApps', () => {
  test('There are two apps here', () => {
    const apps = misc.getAllApps(process.cwd() + '/__test__/dummy/valid_apps')
    expect(apps).toHaveLength(2)
  })

  test('Also from its parent (current working directory)', () => {
    const apps = misc.getAllApps()
    expect(apps).toHaveLength(2)
  })

  test('But there isn\'t any here', () => {
    const apps = misc.getAllApps(process.cwd() + '/__test__/dummy/invalid_apps')
    expect(apps).toHaveLength(0)
  })

  test('In-package apps doesn\'t count also', () => {
    const apps = misc.getAllApps(process.cwd() + '/__test__/dummy/in_pkg_apps')
    expect(apps).toHaveLength(0)
  })
})
