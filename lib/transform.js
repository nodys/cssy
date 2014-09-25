var through2           = require('through2')
var processor          = require('./processor')
var debug              = require('debug')('cssy:transform')
var getGlobalConfig    = require('./utils').getGlobalConfig

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
      var self     = this;
      var debugcss = (process.cssy && process.cssy.config)

      proc(code, function(err, result) {
        var uid      = result.uid
        var source   = result.toString(getGlobalConfig())

        var imports = result.imports.map(function(imp) {
          return '{ cssy: require("'+imp.path+'"), media:"'+imp.media+'"}';
        }).join(',')

        var args = JSON.stringify(source) + ", '" + uid + "', ["+imports+"]";

        if(getGlobalConfig().livereload) {
          args += ",require('cssy/cssyio')"
        }

        self.push("module.exports = (require('cssy/browser'))(" + args + ")");
        done();
      })

    }
  );

  return compiler;
}
