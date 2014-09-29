/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var join             = require('path').join
var cssy             = require('..')
var processor        = cssy.processor
var transform        = cssy.transform
var read             = require('fs').readFileSync
var createReadStream = require('fs').createReadStream
var concatStream     = require('concat-stream')

function fixp(filename) {
  return join(__dirname, '/fixtures', filename);
}

describe('cssy', function(){

  beforeEach(function() {
    cssy.reset();
  })

  describe('processor', function() {

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
      expect(processor(fixp('filter/me.mycss'))).to.be.a('function')
      expect(processor(fixp('filter/notme.css'))).to.be(undefined)
    })

    it('should process a css source', function(done) {
      var filename = fixp('basic/source.css');
      var source   = read(filename).toString();
      var proc     = processor(filename);
      proc(source, function(err, result) {
        if(err) return done(err);
        expect(result).to.be.a('object')
        expect(result).to.have.keys(['imports', 'src', 'map'])
        expect(result.src).to.eql("body{font-size:14px;}")
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
          expect(result.src).to.eql("body{font-size:14px;}")
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

  describe('transform', function() {

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
        expect(src).to.contain('body{font-size:14px;}')
        done();
      }))
    })

    it('should add cssyio if livereload is enabled', function(done) {
      var filename = fixp('basic/source.css');
      cssy.config('livereload', true);
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
  })

  describe('@import', function() {
    it('processor should extract import from sources', function(done) {
      var filename = fixp('import/source.css');
      var source   = read(filename).toString();
      var proc     = processor(filename);
      proc(source, function(err, result) {
        if(err) return done(err);
        expect(result.src).to.eql("body{font-size:14px;}")
        expect(result.imports).to.eql([ { path: './sub/common.css', media: 'screen' } ])
        done()
      })
    })
  })

})
