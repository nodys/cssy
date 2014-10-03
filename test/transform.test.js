/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var cssy             = (process.env.COVERAGE ? require('../src-cov/cssy.js') : require('../src/cssy.js'))
var processor        = cssy.processor
var transform        = cssy.transform
var read             = require('fs').readFileSync
var createReadStream = require('fs').createReadStream
var concatStream     = require('concat-stream')
var fixp             = require('./support').fixp

describe('cssy transform', function(){

  beforeEach(function() {
    cssy.reset();
    cssy.config({
      minify:    true,
      sourcemap: false,
    })
  })

  it('should not transform if source is not css', function(done) {
    var filename = fixp('basic/app.js');
    createReadStream(filename)
    .pipe(transform(filename))
    .pipe(concatStream(function(result) {
      expect(result.toString()).to.eql(read(filename).toString())
      done();
    }))
  })

  it('should process a css source', function(done) {
    var filename = fixp('basic/source.css');
    createReadStream(filename)
    .pipe(transform(filename))
    .pipe(concatStream(function(result) {
      var src = result.toString();
      expect(src).to.contain('module.exports')
      expect(src).to.contain('require(\'../../../src/cssy-browser.js\')')
      expect(src).to.contain('body{font-size:14px}')
      done();
    }))
  })

  it('should add cssyio if livereload is enabled', function(done) {
    var filename = fixp('basic/source.css');

    // Attach to a mock http server to enable livereload
    cssy.attachServer({on:function() {}});

    createReadStream(filename)
    .pipe(transform(filename))
    .pipe(concatStream(function(result) {
      var src = result.toString();
      expect(src).to.contain('module.exports')
      expect(src).to.contain('require(\'../../../src/cssyio.js\')')
      expect(src).to.contain('change:test/fixtures/basic/source.css')
      done();
    }))
  })

  it('should add imported cssy instance to transformed source', function(done) {
    var filename = fixp('import/source.css');
    createReadStream(filename)
    .pipe(transform(filename))
    .pipe(concatStream(function(result) {
      var src = result.toString();
      expect(src).to.contain('[{ cssy: require("./sub/common.css"), media:"screen"}]')
      done();
    }))
  })


})
