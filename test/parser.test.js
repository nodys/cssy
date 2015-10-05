/* global describe it beforeEach */

var expect = require('expect.js')
var cssy = (process.env.COVERAGE ? require('../lib-cov/cssy.js') : require('../lib/cssy.js'))
var processor = cssy.processor
var read = require('fs').readFileSync
var fixp = require('./support').fixp

describe('cssy parser', function () {
  beforeEach(function () {
    cssy.reset()
    cssy.config({
      minify: true,
      sourcemap: false
    })
  })

  function auto (fixturePath) {
    return function (done) {
      var filename = fixp(fixturePath)
      var source = read(filename).toString()
      var proc = processor(filename)
      proc(source, function (err, result) {
        if (err) return done(err)
        expect(result.src).to.eql('body{font-size:14px}')
        done()
      })
    }
  }

  it('with sass', auto('parser/source.sass'))

  it('with scss', auto('parser/source.scss'))

  it('with less', auto('parser/source.less'))

  it('with stylus', auto('parser/source.styl'))

  it('with specific parser', auto('parser/source.mycss'))
})
