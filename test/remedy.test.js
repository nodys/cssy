/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var cssy             = (process.env.COVERAGE ? require('../src-cov/cssy.js') : require('../src/cssy.js'))
var processor        = cssy.processor
var transform        = cssy.transform
var remedy           = cssy.remedy
var read             = require('fs').readFileSync
var createReadStream = require('fs').createReadStream
var concatStream     = require('concat-stream')
var fixp             = require('./support').fixp
var browserify       = require('browserify')
var postcssCalc      = require('postcss-calc');
var postcss          = require('postcss');


describe('cssy with remedy plugin', function(){

  beforeEach(function() {
    cssy.reset();
    cssy.config({
      minify:    true,
      sourcemap: false,
    })
  })

  it('should allow the use of source from package without cssy', function(done) {
    var b = browserify();
    b.plugin(remedy)
    b.add(fixp('remedy/source.css'));
    b.bundle().pipe(concatStream(function(result) {
      var src = result.toString();
      expect(src).to.contain('module.exports')
      expect(src).to.contain('body{font-size:14px}')
      done();
    }))
  })

  it('should use parser, pre-processor, processor, post-processor', function(done) {
    var flags = {
      parser    : false,
      pre       : false,
      processor : false,
      post      : false,
    };

    cssy.pre(function(ctx) {
      flags.pre = true;
      return ctx;
    })

    cssy.post(function(ctx) {
      flags.post = true;
      return ctx;
    })

    var b = browserify();

    b.plugin(remedy, {
      parser: function(ctx) {
        flags.parser = true;
        return ctx;
      },
      processor: function(ctx) {
        flags.processor = true;
        return ctx;
      }
    })

    b.add(fixp('remedy/source.css'));
    b.bundle().pipe(concatStream(function(result) {
      var src = result.toString();
      expect(flags.pre).to.be(true)
      expect(flags.post).to.be(true)
      expect(flags.parser).to.be(true)
      expect(flags.processor).to.be(true)
      expect(src).to.contain('module.exports')
      expect(src).to.contain('body{font-size:14px}')
      done();
    }))
  })


  it('should work with @import too', function(done) {
    var b = browserify();
    b.plugin(remedy)
    b.add(fixp('remedy/source-import.css'));
    b.bundle().pipe(concatStream(function(result) {
      var src = result.toString();
      expect(src).to.contain('module.exports')
      expect(src).to.contain('body{font-size:14px}')
      done();
    }))
  })


})
