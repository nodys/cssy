var slash = require('slash')
var through2 = require('through2')
var getProcessor = require('./processor')
var pathResolve = require('path').resolve
var pathRelative = require('path').relative
var dirname = require('path').dirname

/**
* Browserify transform (see browsreify API)
*/
module.exports = function (filename, config) {
  // Get cssy source processor
  var proc = getProcessor(filename, config)

  // If undefined, then ignore and pass through
  if (!proc) return through2()

  var code = ''
  return through2(
    function (chunk, encoding, next) {
      code += chunk.toString()
      next()
    },
    function (done) {
      var self = this

      proc(code, function (err, result) {
        if (err) return done(err)

        var imports = result.imports.map(function (imp) {
          return '{ module: require("' + imp.path + '"), media:"' + imp.media + '"}'
        }).join(',')

        var browserPath = rPath('./cssy-browser.js', filename)
        var cssyioPath = rPath('./cssyio.js', filename)

        self.push("module.exports = (require('" + browserPath + "'))(" + JSON.stringify(result.src) + ', [' + imports + ']' + ');')

        if (process.cssy.livereload) {
          self.push("\nrequire('" + cssyioPath + "').on('change:" + result.filename + "', function(src) { module.exports.update(src)})")
        }

        done()
      })

    }
  )
}

/**
* Generate a relative path to a cssy file, relative to source file
*
* @param {string} cssyFile
*        Path relative to current module
*
* @param {string} sourceFilepath
*        The source filepath
*
* @return {string}
*         A relative path to cssyFile from a transformed source
*/
function rPath (cssyFile, sourceFilepath) {
  cssyFile = pathResolve(__dirname, cssyFile)
  cssyFile = pathRelative(dirname(sourceFilepath), cssyFile)
  cssyFile = slash(cssyFile)
  if (!/^(\.|\/)/.test(cssyFile)) {
    return './' + cssyFile
  } else {
    return cssyFile
  }
}
