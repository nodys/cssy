/* global describe it beforeEach */

var expect = require('expect.js')
var cssy = (process.env.COVERAGE ? require('../lib-cov/cssy.js') : require('../lib/cssy.js'))
var remedy = cssy.remedy
var concatStream = require('concat-stream')
var fixp = require('./support').fixp
var browserify = require('browserify')

describe('cssy with remedy plugin', function () {
  beforeEach(function () {
    cssy.reset()
    cssy.config({
      minify: true,
      sourcemap: false
    })
  })

  it('should allow the use of source from package without cssy', function (done) {
    var b = browserify()
    b.plugin(remedy)
    b.add(fixp('remedy/node_modules/bar/bar.css'))
    b.bundle().pipe(concatStream(function (result) {
      var src = result.toString()
      expect(src).to.contain('module.exports')
      expect(src).to.contain('.bar{display:inline}')
      done()
    }))
  })

  it('should use parser, pre-processor, processor, post-processor', function (done) {
    var flags = {
      parser: false,
      pre: false,
      processor: false,
      post: false
    }

    cssy.pre(function (ctx) {
      flags.pre = true
      return ctx
    })

    cssy.post(function (ctx) {
      flags.post = true
      return ctx
    })

    var b = browserify()

    b.plugin(remedy, {
      parser: function (ctx) {
        flags.parser = true
        return ctx
      },
      processor: function (ctx) {
        flags.processor = true
        return ctx
      }
    })

    b.add(fixp('remedy/node_modules/bar/bar.css'))
    b.bundle().pipe(concatStream(function (result) {
      var src = result.toString()
      expect(flags.pre).to.be(true)
      expect(flags.post).to.be(true)
      expect(flags.parser).to.be(true)
      expect(flags.processor).to.be(true)
      expect(src).to.contain('module.exports')
      expect(src).to.contain('.bar{display:inline}')
      done()
    }))
  })

  it('should work with @import too', function (done) {
    var handled = []
    var b = browserify()
    b.plugin(remedy, {
      processor: function (ctx) {
        handled.push(ctx.filename)
        return ctx
      }
    })
    b.add(fixp('remedy/source-import.css'))
    b.bundle().pipe(concatStream(function (result) {
      var src = result.toString()
      expect(src).to.contain('module.exports')

      // source-import.css imports bar/bar.css
      // bar/bar.css imports foo/foo.css
      // foo/foo.css imports qux/qux.css
      expect(handled).to.contain('test/fixtures/remedy/node_modules/bar/bar.css')
      expect(handled).to.contain('test/fixtures/remedy/node_modules/foo/foo.css')

      // qux does not need remedy:
      expect(handled).not.to.contain('test/fixtures/remedy/node_modules/qux/qux.css')

      expect(src).to.contain('.bar{display:inline}')
      expect(src).to.contain('.foo{display:inline}')
      expect(src).to.contain('.qux{display:inline}')
      done()
    }))
  })
})
