/* global describe it beforeEach */

var expect = require('expect.js')
var cssy = (process.env.COVERAGE ? require('../lib-cov/cssy.js') : require('../lib/cssy.js'))
var processor = cssy.processor
var read = require('fs').readFileSync
var EventEmitter = require('events').EventEmitter
var fixp = require('./support').fixp
var browserify = require('browserify')
var concatStream = require('concat-stream')

describe('cssy', function () {
  beforeEach(function () {
    cssy.reset()
    cssy.config({
      minify: true,
      sourcemap: false
    })
  })

  it('can be used as browserify transform', function (done) {
    var b = browserify()
    b.transform(cssy)
    b.add(fixp('basic/source.css'))
    b.bundle()
      .pipe(concatStream(function (result) {
        var src = result.toString()
        expect(src).to.contain('module.exports')
        expect(src).to.contain("require('../../../lib/cssy-browser.js')")
        expect(src).to.contain('body{font-size:14px}')
        done()
      }))
  })

  it('can be used as browserify plugin', function (done) {
    var flags = { }
    var mockServer = {
      on: function () {
        flags.live = true
      }
    }

    var b = browserify()
    b.plugin(cssy, {
      minify: true,
      sourcemap: true,
      pre: function (ctx) { flags.pre = true; return ctx },
      post: function (ctx) { flags.post = true; return ctx },
      live: mockServer,
      remedy: true
    })

    b.add(fixp('remedy/source.css'))

    b.bundle()
      .pipe(concatStream(function (result) {
        var src = result.toString()
        expect(flags.pre).to.be(true)
        expect(flags.post).to.be(true)
        expect(flags.live).to.be(true)
        expect(src).to.contain('module.exports')
        expect(src).to.contain('sourceMap')
        expect(src).to.contain('cssyio')
        expect(src).to.contain("require('../../../lib/cssy-browser.js')")
        expect(src).to.contain('body{font-size:14px}')
        done()
      }))

  })

  describe('.attachServer()', function () {
    it('should attach a lrio server and send transformed source to client', function (done) {
      // Mock http server:
      var mockServer = {on: function () {}}

      // Attach cssy
      var cssylr = cssy.attachServer(mockServer)

      // Mock lrioServer broadcast method:
      cssylr.lrioServer.broadcast = function (data) {
        expect(data.type).to.eql('change')
        expect(data.uid).to.eql('test/fixtures/import/source.css')
        expect(data.src).to.contain('font-size:14px')
        done()
      }

      // Emit change on a file
      cssylr(fixp('import/source.css'))

    })
  })

  describe('.pre() / .post()', function () {
    it('should add global pre/post-processor', function (done) {
      var steps = []

      cssy.pre([
        function (ctx, done) {
          steps.push('pre1')
          done(null, ctx)
        },
        function (ctx, done) {
          steps.push('pre2')
          done(null, ctx)
        }
      ])

      cssy.post([
        function (ctx, done) {
          steps.push('post1')
          done(null, ctx)
        },
        function (ctx, done) {
          steps.push('post2')
          done(null, ctx)
        }
      ])

      var filename = fixp('basic/source.css')
      var source = read(filename).toString()
      var proc = processor(filename)
      proc(source, function (err, result) {
        if (err) return done(err)
        expect(steps).to.eql(['pre1', 'pre2', 'post1', 'post2'])
        done()
      })
    })

    it('should accept string (path resolved from cwd())', function (done) {
      cssy.pre(fixp('processor/preProcessor.js'))
      cssy.post(fixp('processor/postProcessor.js'))
      cssy.config({minify: false})
      var filename = fixp('processor/source.css')
      var source = read(filename).toString()
      var proc = processor(filename)
      proc(source, function (err, result) {
        if (err) return done(err)
        var src = result.src
        expect(src).to.contain('preProcessor')
        expect(src).to.contain('postProcessor')
        done()
      })
    })
  })

  describe('.live()', function () {
    it('should attach a lrio server and watch for processed source change', function (done) {
      var filename = fixp('basic/source.css')
      var source = read(filename).toString()
      var proc = processor(filename)

      // Mock http server:
      var mockServer = new EventEmitter()
      var mockChokidar = new EventEmitter()
      mockChokidar.add = function (_file) {
        mockChokidar.file = _file
      }

      // Attach cssy
      var cssylr = cssy.live(mockServer, mockChokidar)

      // Transform a source
      proc(source, function (err, result) {
        if (err) {
          throw err
        }

        // Now, mockChockidar must watch for file
        expect(mockChokidar.file).to.eql('test/fixtures/basic/source.css')

        // Emit change on file:
        mockChokidar.emit('change', mockChokidar.file)

      })

      // Mock lrioServer broadcast method:
      cssylr.lrioServer.broadcast = function (data) {
        expect(data.type).to.eql('change')
        expect(data.uid).to.eql('test/fixtures/basic/source.css')
        expect(data.src).to.contain('font-size:14px')
        done()
      }

    })

    it('should accept string (path resolved from cwd())', function (done) {
      cssy.live(fixp('live/mockserver.js'))
      var filename = fixp('basic/source.css')
      var source = read(filename).toString()
      var proc = processor(filename)
      proc(source, function (err, result) {
        if (err) return done(err)
        expect(process._cssy_live).to.be(true)
        done()
      })
    })
  })
})
