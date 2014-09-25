/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var join             = require('path').join
var cssy             = require('../index.js')
var processor        = require('../lib/processor')
var transform        = require('../lib/transform')
var read             = require('fs').readFileSync
var createReadStream = require('fs').createReadStream
var concatStream     = require('concat-stream')

function fixp(filename) {
  return join(__dirname, '/fixtures', filename);
}

describe('cssy', function(){
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
        expect(result).to.have.keys(['imports', 'uid', 'toString'])
        expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
        done()
      })


    })

    describe('with rework plugin', function() {
      it('should apply rework plugin', function(done) {
        var filename = fixp('rework/source.css');
        var source   = read(filename).toString();
        var proc     = processor(filename);
        proc(source, function(err, result) {
          if(err) return done(err);
          expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
          done()
        })

      })

      it('should apply rework plugin with arguments', function(done) {
        var filename = fixp('rework-withargs/source.css');
        var source   = read(filename).toString();
        var proc     = processor(filename);
        proc(source, function(err, result) {
          if(err) return done(err);
          expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
          done()
        })

      })

      it('should apply rework plugin with arguments from external module', function(done) {
        var filename = fixp('rework-withargs-external/source.css');
        var source   = read(filename).toString();
        var proc     = processor(filename);
        proc(source, function(err, result) {
          if(err) return done(err);
          expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
          done()
        })
      })
    })

    describe('with global pre/post processor', function() {

      afterEach(function() {
        cssy.reset();
      })

      it('should run pre-process as waterfall', function(done) {

        cssy.pre([
          function(rw, done) {
            rw._test = [];
            rw._test.push('pre1')
            done(null, rw);
          },
          function(rw, done) {
            rw._test.push('pre2')
            done(null, rw);
          },
        ])

        cssy.post([
          function(rw, done) {
            rw._test.push('post1')
            done(null, rw);
          },
          function(rw, done) {
            rw._test.push('post2')
            done(null, rw);
          }
        ])

        var filename = fixp('basic/source.css');
        var source   = read(filename).toString();
        var proc     = processor(filename);
        proc(source, function(err, result) {
          if(err) return done(err);
          expect(result._test).to.eql(['pre1','pre2', 'post1', 'post2'])
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
      var filename = fixp('rework/source.css');
      createReadStream(filename)
      .pipe(transform(filename))
      .pipe(concatStream(function(result) {
        expect(result.toString())
          .to.eql("module.exports = (require('cssy/browser'))(\"body{font-size:14px;}\", '986287257254767c753a0e9ca2097afb', [])")
        done();
      }))
    })

    it('should process a css source', function(done) {
      var filename = fixp('rework/source.css');
      createReadStream(filename)
      .pipe(transform(filename))
      .pipe(concatStream(function(result) {
        expect(result.toString())
          .to.eql("module.exports = (require('cssy/browser'))(\"body{font-size:14px;}\", '986287257254767c753a0e9ca2097afb', [])")
        done();
      }))
    })


  })
})
