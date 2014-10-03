/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var cssy             = (process.env.COVERAGE ? require('../src-cov/cssy.js') : require('../src/cssy.js'))
var processor        = cssy.processor
var transform        = cssy.transform
var read             = require('fs').readFileSync
var createReadStream = require('fs').createReadStream
var concatStream     = require('concat-stream')
var EventEmitter     = require('events').EventEmitter
var fixp             = require('./support').fixp

describe('cssy', function(){

  beforeEach(function() {
    cssy.reset();
    cssy.config({
      minify:    true,
      sourcemap: false,
    })
  })

  describe('@import', function() {
    it('processor should extract import from sources', function(done) {
      var filename = fixp('import/source.css');
      var source   = read(filename).toString();
      var proc     = processor(filename);
      proc(source, function(err, result) {
        if(err) return done(err);
        expect(result.src).to.eql("body{font-size:14px}")
        expect(result.imports).to.eql([ { path: './sub/common.css', media: 'screen' } ])
        done()
      })
    })
  })

  describe('.attachServer()', function() {
    it('should attach a lrio server and send transformed source to client', function(done) {

      // Mock http server:
      var mockServer = {on:function() {}};

      // Attach cssy
      var cssylr = cssy.attachServer(mockServer)

      // Mock lrioServer broadcast method:
      cssylr.lrioServer.broadcast = function(data) {
        expect(data.type).to.eql('change')
        expect(data.uid).to.eql('test/fixtures/import/source.css')
        expect(data.src).to.contain('font-size:14px')
        done();
      }

      // Emit change on a file
      cssylr(fixp('import/source.css'));

    })
  })

  describe('.live()', function() {
    it('should attach a lrio server and watch for processed source change', function(done) {

      var filename = fixp('basic/source.css');
      var source   = read(filename).toString();
      var proc     = processor(filename);

      // Mock http server:
      var mockServer   = new EventEmitter();
      var mockChokidar = new EventEmitter();
      mockChokidar.add = function(_file) {
        mockChokidar.file = _file;
      }

      // Attach cssy
      var cssylr   = cssy.live(mockServer, mockChokidar)

      // Transform a source
      proc(source, function(err, result) {

        // Now, mockChockidar must watch for file
        expect(mockChokidar.file).to.eql('test/fixtures/basic/source.css')

        // Emit change on file:
        mockChokidar.emit('change', mockChokidar.file)

      })

      // Mock lrioServer broadcast method:
      cssylr.lrioServer.broadcast = function(data) {
        expect(data.type).to.eql('change')
        expect(data.uid).to.eql('test/fixtures/basic/source.css')
        expect(data.src).to.contain('font-size:14px')
        done();
      }

    })
  })
})
