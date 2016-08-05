/* global describe it beforeEach */

var expect = require('expect.js')
var cssy = (process.env.COVERAGE ? require('../lib-cov/cssy.js') : require('../lib/cssy.js'))
var processor = cssy.processor
var read = require('fs').readFileSync
var fixp = require('./support').fixp

describe('cssy processor', function () {
  beforeEach(function () {
    cssy.reset()
    cssy.config({
      minify: true,
      sourcemap: false
    })
  })

  it('should return a function if source is valid', function () {
    var filename = fixp('basic/source.css')
    var proc = processor(filename)
    expect(proc).to.be.a('function')
  })

  it('should return undefined if source does not exists', function () {
    var filename = fixp('basic/doesnotexists.css')
    var proc = processor(filename)
    expect(proc).to.be(undefined)
  })

  it('should return undefined if source is not css', function () {
    var filename = fixp('basic/app.js')
    var proc = processor(filename)
    expect(proc).to.be(undefined)
  })

  it('should use `match` option to filter acceptable source (override regex for .css)', function () {
    expect(processor(fixp('filter-simple/me.mycss'))).to.be.a('function')
    expect(processor(fixp('filter-simple/notme.css'))).to.be(undefined)
  })

  it('should use `match` option to filter acceptable source (override regex for .css) with regex flags', function () {
    expect(processor(fixp('filter-flags/me.mycss'))).to.be.a('function')
    expect(processor(fixp('filter-flags/notme.css'))).to.be(undefined)
  })

  it('should process a css source', function (done) {
    var filename = fixp('basic/source.css')
    var source = read(filename).toString()
    var proc = processor(filename)
    proc(source, function (err, result) {
      if (err) return done(err)
      expect(result).to.be.a('object')
      expect(result).to.have.keys(['imports', 'src', 'map'])
      expect(result.src).to.eql('body{font-size:14px}')
      done()
    })
  })

  it('should throw an error on invalid css source', function (done) {
    var filename = fixp('basic/invalid.css')
    var source = read(filename).toString()
    var proc = processor(filename)
    proc(source, function (err, result) {
      expect(err.message).to.contain('test/fixtures/basic/invalid.css:1:1: Unclosed block')
      done()
    })
  })

  it.skip('should throw an error on unknown format', function (done) {
    // NOTICE: Seems to work anyway
    var filename = fixp('basic/unknownformat.metacss')
    var source = read(filename).toString()
    var proc = processor(filename, { match: /metacss$/ })
    proc(source, function (err, result) {
      expect(err.message).to.contain('Try to use appropriate parser for')
      done()
    })
  })

  it('should support empty css source', function (done) {
    var filename = fixp('empty/source.css')
    var source = read(filename).toString()
    var proc = processor(filename)
    proc(source, function (err, result) {
      if (err) return done(err)
      expect(result.src).to.eql('')
      done()
    })
  })

  it('should provide a sourcemap if enable', function (done) {
    cssy.config({sourcemap: true})
    var filename = fixp('basic/source.css')
    var source = read(filename).toString()
    var proc = processor(filename)
    proc(source, function (err, result) {
      if (err) return done(err)
      expect(result.src).to.contain('body{font-size:14px}')
      expect(result.src).to.contain('/*# sourceMappingURL=data:application/json;base64,')
      done()
    })
  })

  describe('with source processor', function () {
    it('should work with a processor defined in package.json', function (done) {
      var filename = fixp('processor/source.css')
      var source = read(filename).toString()
      var proc = processor(filename)
      proc(source, function (err, result) {
        if (err) return done(err)
        expect(result.src).to.eql('body{font-size:14px}')
        done()
      })
    })
  })

  describe('supplied autoprefixer processor (cssy/autoprefixer)', function () {
    it('should run autoprefixer on source', function (done) {
      var filename = fixp('autoprefixer/source.css')
      var source = read(filename).toString()
      var proc = processor(filename)
      proc(source, function (err, result) {
        if (err) return done(err)
        expect(result.src).to.eql('body{display:-webkit-box;display:-ms-flexbox;display:flex}')
        done()
      })
    })
  })
})
