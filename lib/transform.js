var through2     = require('through2')
var crypto       = require('crypto')
var processorFor = require('./utils').processorFor
var dirname      = require('path').dirname
var pathHash     = require('./utils').pathHash
var combiner      = require('stream-combiner')

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
      console.log('Receive chunk', chunk.toString())
      src += chunk.toString();
      next()
    },
    function (done) {
      this.push("module.exports = (require('cssy'))(" + JSON.stringify(src) + ", '"+hash+"')");
      done();
    }
  );

  return combiner(processor, compiler)
}
