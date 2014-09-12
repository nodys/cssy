var crypto          = require('crypto')
var debug           = require('debug')('cssy')
var through2        = require('through2')
var dirname         = require('path').dirname
var relativePackage = require('relative-package')


exports.pathHash = function(path) {
  return crypto.createHash('md5').update(path).digest('hex')
}


exports.processorFor = function(filename) {
  var pkgPath = relativePackage(filename)
  if(!pkgPath) return defaultProcessor;

  var pkg = require(pkgPath)
  if(!pkg.cssy || !pkg.cssy.processor) return defaultProcessor;

  try {
    return require(resolve.sync(pkg.cssy.processor, { basedir: dirname(pkgPath) }))
  } catch(e) {
    return defaultProcessor;
  }
}

function defaultProcessor() {
  return through2()
}
