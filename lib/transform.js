var through2           = require('through2')
var processor          = require('./processor')
var debug              = require('debug')('cssy:transform')

module.exports = function (filename) {
  var proc = processor(filename);

  if(!proc) return through2();

  debug('Transform', filename)

  var code      = '';

  return through2(
    function (chunk, encoding, next) {
      code += chunk.toString();
      next()
    },
    function (done) {
      var debugcss = require('debug').enabled('cssy')
      var result   = proc(code)
      var uid      = result.uid
      var source   = result.toString({sourcemap: debugcss})

      var imports = result.imports.map(function(imp) {
        return '{ cssy: require("'+imp.path+'"), media:"'+imp.media+'"}';
      }).join(',')

      var args = JSON.stringify(source) + ", '" + uid + "', ["+imports+"]";

      if(debugcss) {
        args += ",require('cssy/cssyio')"
      }

      this.push("module.exports = (require('cssy/browser'))(" + args + ")");
      done();
    }
  );

  return compiler;
}
