var through2     = require('through2')
var crypto       = require('crypto')
var processorFor = require('./utils').processorFor
var dirname      = require('path').dirname
var pathHash     = require('./utils').pathHash
var combiner     = require('stream-combiner')
var basename     = require('path').basename
var debug        = require('debug')('cssy:transform')

var relative     = require('path').relative


module.exports = function (filename, options) {
  options = options || {};
  if (options.match) {
    if(!(new RegExp(options.match)).test(filename)) {
      return through2()
    }
  } else if (!/\.css$/i.test(filename)) {
    return through2()
  }

  var hash      = pathHash(filename)
  var processor = processorFor(filename);

  var src       = '';
  var compiler  = through2(
    function (chunk, encoding, next) {
      src += chunk.toString();
      next()
    },
    function (done) {
      if(require('debug').enabled('cssy:live')) {
        debug('Live reload enabled')
        src = "module.exports = (require('cssy/browser'))(" + JSON.stringify(src) + ", '"+hash+"', require('cssy/cssyio'));";
      } else {
        src = "module.exports = (require('cssy/browser'))(" + JSON.stringify(src) + ", '"+hash+"');";
      }
      this.push(src);
      done();
    }
  );

  return combiner(processor, compiler)
}
