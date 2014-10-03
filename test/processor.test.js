/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var join             = require('path').join
var cssy             = (process.env.COVERAGE ? require('../src-cov/cssy.js') : require('../src/cssy.js'))
var processor        = cssy.processor
var read             = require('fs').readFileSync
var fixp             = require('./support').fixp

describe('cssy processor', function(){

  beforeEach(function() {
    cssy.reset();
    cssy.config({
      minify:    true,
      sourcemap: false,
    })
  })

  it('should return a function if source is valid', function() {
    var filename = fixp('basic/source.css');
    var proc     = processor(filename);
    expect(proc).to.be.a('function')
  })

  it('should return undefined if source does not exists', function() {
    var filename = fixp('basic/doesnotexists.css');
    var proc     = processor(filename);
    expect(proc).to.be(undefined)
  })

  it('should return undefined if source is not css', function() {
    var filename = fixp('basic/app.js');
    var proc     = processor(filename);
    expect(proc).to.be(undefined)
  })

  it('should use `match` option to filter acceptable source (override regex for .css)', function() {
    expect(processor(fixp('filter-simple/me.mycss'))).to.be.a('function')
    expect(processor(fixp('filter-simple/notme.css'))).to.be(undefined)
  })

  it('should use `match` option to filter acceptable source (override regex for .css) with regex flags', function() {
    expect(processor(fixp('filter-flags/me.mycss'))).to.be.a('function')
    expect(processor(fixp('filter-flags/notme.css'))).to.be(undefined)
  })

  it('should process a css source', function(done) {
    var filename = fixp('basic/source.css');
    var source   = read(filename).toString();
    var proc     = processor(filename);
    proc(source, function(err, result) {
      if(err) return done(err);
      expect(result).to.be.a('object')
      expect(result).to.have.keys(['imports', 'src', 'map'])
      expect(result.src).to.eql("body{font-size:14px}")
      done()
    })
  })


  it('should support empty css source', function(done) {
    var filename = fixp('empty/source.css');
    var source   = read(filename).toString();
    var proc     = processor(filename);
    proc(source, function(err, result) {
      if(err) return done(err);
      expect(result.src).to.eql("")
      done()
    })
  })

  it('should provide a sourcemap if enable', function(done) {
    cssy.config({sourcemap:true})
    var filename = fixp('basic/source.css');
    var source   = read(filename).toString();
    var proc     = processor(filename);
    proc(source, function(err, result) {
      if(err) return done(err);
      expect(result.src).to.contain("body{font-size:14px}")
      expect(result.src).to.contain("/*# sourceMappingURL=data:application/json;base64,")
      expect(result.src).to.contain("/*# sourceURL=test/fixtures/basic/source.css.output")
      done()
    })

  })


  describe('with source processor', function() {
    it('should work with a processor defined in package.json', function(done) {
      var filename = fixp('processor/source.css');
      var source   = read(filename).toString();
      var proc     = processor(filename);
      proc(source, function(err, result) {
        if(err) return done(err);
        expect(result.src).to.eql("body{font-size:14px}")
        done()
      })
    })
  })

  describe('with global pre/post processor', function() {

    it('should run pre-process as waterfall', function(done) {
      var steps = [];

      cssy.pre([
        function(ctx, done) {
          steps.push('pre1')
          done(null, ctx);
        },
        function(ctx, done) {
          steps.push('pre2')
          done(null, ctx);
        },
      ])

      cssy.post([
        function(ctx, done) {
          steps.push('post1')
          done(null, ctx);
        },
        function(ctx, done) {
          steps.push('post2')
          done(null, ctx);
        }
      ])

      var filename = fixp('basic/source.css');
      var source   = read(filename).toString();
      var proc     = processor(filename);
      proc(source, function(err, result) {
        if(err) return done(err);
        expect(steps).to.eql(['pre1','pre2', 'post1', 'post2'])
        done()
      })
    })
  })

})
