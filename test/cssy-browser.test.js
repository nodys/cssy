/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var join             = require('path').join
var cssy             = require('..')
var processor        = cssy.processor
var transform        = cssy.transform
var read             = require('fs').readFileSync
var createReadStream = require('fs').createReadStream
var concatStream     = require('concat-stream')
var jsdom            = require('jsdom')
var browserify       = require('browserify')

function fixp(filename) {
  return join(__dirname, '/fixtures', filename);
}

describe('cssy browser', function(){

  beforeEach(function() {
    cssy.reset();
  })

  describe('require css in commonjs source', function() {

    it('@import should import processed sources with right media query', function(done) {
      var b = browserify(fixp('browser/import.js'))
      b.bundle().pipe(concatStream(function(result) {
        var bundle = result.toString();
        jsdom.env({
          'html': '<head></head><body></body>',
          'src' : [bundle],
          'done': function(error, window) {
            var result = window.document.documentElement.outerHTML;
            expect(result).to.contain('<style type="text/css" media="screen">body{background-color:#663399}</style>')
            expect(result).to.contain('<style type="text/css">body{font-size:14px;}</style>')
            done();
          }
        })
      }))
    })

    it.only('@import should work with npm package without cssy transform', function(done) {
      var b = browserify(fixp('browser/nocssy.js'))
      b.bundle().pipe(concatStream(function(result) {
        var bundle = result.toString();
        jsdom.env({
          'html': '<head></head><body></body>',
          'src' : [bundle],
          'done': function(error, window) {
            var result = window.document.documentElement.outerHTML;
            expect(result).to.contain('<style type="text/css" media="screen">body{background-color:#663399}</style>')
            done();
          }
        })
      }))
    })

  })

})
