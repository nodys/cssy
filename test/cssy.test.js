/* jshint undef: false, unused: false */

var cssy      = require('../')
var expect    = require('expect.js')
var join      = require('path').join
var processor = require('../lib/processor')
var read      = require('fs').readFileSync


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

    it('should process a css source', function() {
      var filename = fixp('basic/source.css');
      var source   = read(filename).toString();
      var proc     = processor(filename);
      var result   = proc(source);

      expect(result).to.be.a('object')
      expect(result).to.have.keys(['imports', 'uid', 'toString'])

      expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
    })

    describe('with rework plugin', function() {
      it('should apply rework plugin', function() {
        var filename = fixp('rework/source.css');
        var source   = read(filename).toString();
        var proc     = processor(filename);
        var result   = proc(source);

        expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
      })

      it('should apply rework plugin with arguments', function() {
        var filename = fixp('rework-withargs/source.css');
        var source   = read(filename).toString();
        var proc     = processor(filename);
        var result   = proc(source);

        expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
      })

      it('should apply rework plugin with arguments from external module', function() {
        var filename = fixp('rework-withargs-external/source.css');
        var source   = read(filename).toString();
        var proc     = processor(filename);
        var result   = proc(source);

        expect(result.toString()).to.eql("body {\n  font-size: 14px;\n}")
      })

    })

  })
})
