
var through2        = require('through2')
var syntaxError     = require('syntax-error')
var transform       = require('./transform')
var concatStream    = require('concat-stream')
var Stream          = require('stream')
var resolve         = require('path').resolve
var getCssyConfig   = require('./utils').getCssyConfig

module.exports = function(b, config) {

  if('string' == typeof(config)) {
    config = require(resolve(config));
  }

  if('[object Object]' != Object.prototype.toString.call(config)) {
    config = getCssyConfig(); // Default is the cwd package.json
  }

  if(!config.basedir) {
    config.basedir = process.cwd();
  }

  var match     = config.match || ['\\.(css|sass|scss|less|styl)$', 'i'];

  if(!(match instanceof RegExp)) {
    match = RegExp.apply(null, Array.isArray(match) ? match : [match])
  }

  match = RegExp.apply(null, match)

  b.transform({global: true}, function(filename) {

    if(!match.test(filename)) return through2();

    var code      = '';
    return through2(
      function (chunk, encoding, next) {
        code += chunk.toString();
        next()
      },
      function (done) {
        var self     = this;

        if(!syntaxError(code, filename)) {
          self.push(code);
          done();
        } else {
          var readable = through2()
          readable.pipe(transform(filename, config))
          .pipe(concatStream(function(result) {
            self.push(result)
            done();
          }))
          readable.push(code)
          readable.end()
        }
      }
    )
  })


}
