/* jshint undef: false, unused: false */

var expect           = require('expect.js')
var cssy             = (process.env.COVERAGE ? require('../lib-cov/cssy.js') : require('../lib/cssy.js'))
var read             = require('fs').readFileSync
var concatStream     = require('concat-stream')
var jsdom            = require('jsdom')
var browserify       = require('browserify')

var fixp             = require('./support').fixp

describe('cssy browser', function(){

  beforeEach(function() {
    cssy.reset();
    cssy.config({
      minify:    true,
      sourcemap: false,
    })
  })

  function readJsdomError(errors) {
    var msg = errors.reduce(function(memo, item) {
      return memo += item.type + ' ' + item.message + ':\n  ' + item.data.error.message
    }, '')
    return new Error(msg);
  }

  function simu(fixturePath, callback) {
    var srcPath  = fixp(fixturePath) + '/index.js';
    var html     = read(fixp(fixturePath) + '/index.html');

    browserify(srcPath)
    .plugin(cssy, {remedy:true})
    .bundle().pipe(concatStream(function(result) {
      var bundle = result.toString();
      jsdom.env({
        html: html.toString(),
        src : [bundle],
        created: function(error, window) {
          if(error) return callback(error);
          jsdom.getVirtualConsole(window).sendTo(console)
        },
        done: function(errors, window) {
          if(errors && errors.length)  {
            return callback(readJsdomError(errors));
          }
          callback(null, window)
        }
      })
    }))
  }

  function auto(fixturePath) {
    var expected = read(fixp(fixturePath) + '/expected.html').toString().trim().replace(/\n/g,'');;
    return function(done) {
      simu(fixturePath, function(err, window) {
        if(err) return done(err)
        var result = window.document.documentElement.outerHTML.trim().replace(/\n/g,'');
        expect(result).to.eql(expected)
        done();
      })
    }
  }

  it('.insert() should insert style in the given node',
    auto('browser/insert'))

  it('@import should import sources with media query attribute',
    auto('browser/import'))

  it('@import should import sources from other kind of modules',
    auto('browser/import-notcssy'))

  it('@import should import css source from module that does not provide cssy transform thanks to remedy plugin',
    auto('browser/import-remedy'))

  it('.remove() should remove sources and imported sources',
    auto('browser/remove'))

  it('.insert() must insert source only once per media and parent',
    auto('browser/insert-many-once'))

  it('.remove() must remove sources only when no more instance is required remain',
    auto('browser/remove-many-once'))

  it('.update() should update sources',
    auto('browser/update'))

  it('.toString() should return css source (implicit toString())',
    auto('browser/tostring'))

  it('If enabled, style must listening for cssy livereload web socket', function(done) {

    // Attach to a mock http server to enable livereload
    cssy.attachServer({on:function() {}});

    var fixturePath = 'browser/livereload';
    var srcPath     = fixp(fixturePath) + '/index.js';
    var html        = read(fixp(fixturePath) + '/index.html');
    var expected    = read(fixp(fixturePath) + '/expected.html').toString().trim().replace(/\n/g,'');;
    var socket;

    browserify(srcPath).bundle().pipe(concatStream(function(result) {
      var bundle = result.toString();
      jsdom.env({
        'html': html,
        'src' : [bundle],
        'created': function(errors, window) {
          if(errors && errors.length)  return done(readJsdomError(errors));

          // Mock XMLHttpRequest for lrio
          window.XMLHttpRequest = function() {
            var self = this;
            self.readyState = 2;
            self.getResponseHeader = function() {return 'enabled'}
            self.open = function() {}
            self.send = function() {
              self.onreadystatechange()
            }
          }
          // Mock WebSocket for lrio
          window.WebSocket = function() { socket = this }

        },
        'done': function(errors, window) {
          if(errors && errors.length)  return done(readJsdomError(errors));

          // Simulate a change event :
          socket.onmessage({
            data: JSON.stringify({
              type: 'change',
              uid:  'test/fixtures/browser/livereload/index.css',
              src:  'body{font-size:42px}'
            })
          })

          var result = window.document.documentElement.outerHTML.trim().replace(/\n/g,'');
          expect(result).to.eql(expected)
          done();
        }
      })
    }))
  })


})
