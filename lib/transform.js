var through2           = require('through2')
var getUid             = require('./utils').getUid
var sourcemapToComment = require('./utils').sourcemapToComment
var processor          = require('./processor')
var combiner           = require('stream-combiner')
var relative           = require('path').relative
var debug              = require('debug')('cssy:transform')
var extractImports     = require('./extractImports')

module.exports = function (filename) {

  var proc = processor(filename);

  if(!proc) return through2();

  debug('Transform', filename)

  var src       = '';
  var compiler  = through2(
    function (chunk, encoding, next) {
      src += chunk.toString();
      next()
    },
    function (done) {
      var uid    = getUid(filename)

      var result = extractImports(src, filename)

      src  = result.code;
      src += '\n' + sourcemapToComment(result.map);

      var imports = result.imports.map(function(imp) {
        return '{ cssy: require("'+imp.path+'"), media:"'+imp.media+'"}';
      }).join(',')

      var args = JSON.stringify(src) + ", '" + uid + "', ["+imports+"]";

      if(require('debug').enabled('cssy:live')) {
        args += ",require('cssy/cssyio')"
      }

      this.push("module.exports = (require('cssy/browser'))(" + args + ")");
      done();
    }
  );

  return combiner(proc, compiler)
}
