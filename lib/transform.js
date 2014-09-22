var through2     = require('through2')
var pathHash     = require('./utils').pathHash
var processorFor = require('./utils').processorFor
var combiner     = require('stream-combiner')
var relative     = require('path').relative
var debug        = require('debug')('cssy:transform')

module.exports = function (filename) {

  var processor = processorFor(filename);

  if(!processor) return through2();

  debug('Transform', filename)

  var src       = '';
  var compiler  = through2(
    function (chunk, encoding, next) {
      src += chunk.toString();
      next()
    },
    function (done) {
      var hash      = pathHash(filename)
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
