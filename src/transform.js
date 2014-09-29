var through2           = require('through2')
var processor          = require('./processor')
var pathResolve        = require('path').resolve

module.exports = function (filename) {
  var proc = processor(filename);

  if(!proc) return through2();

  var code      = '';

  return through2(
    function (chunk, encoding, next) {
      code += chunk.toString();
      next()
    },
    function (done) {
      var self     = this;

      proc(code, function(err, result) {
        if(err) return done(err);

        var imports  = result.imports.map(function(imp) {
          return '{ cssy: require("'+imp.path+'"), media:"'+imp.media+'"}';
        }).join(',')

        var browserPath = pathResolve(__dirname, './cssy-browser.js')
        var cssyioPath  = pathResolve(__dirname, './cssyio.js')

        self.push("module.exports = (require('"+browserPath+"'))(" + JSON.stringify(result.src) + ", ["+imports+"]" + ");");

        if(process.cssy.config.livereload) {
          self.push("\nrequire('"+cssyioPath+"').on('change:"+result.filename+"', function(src) { module.exports.update(src)})");
        }

        done();
      })

    }
  );

  return compiler;
}
