var crypto          = require('crypto')
var debug           = require('debug')('cssy')
var through2        = require('through2')
var dirname         = require('path').dirname
var relativePackage = require('relative-package')
var resolve         = require('resolve')


exports.pathHash = function(path) {
  return crypto.createHash('md5').update(path).digest('hex')
}


exports.processorFor = function(filename) {
  var pkgPath   = relativePackage(filename)
  var pkg       = require(pkgPath)
  var config    = getCssyConfig(pkg) || {};
  var processor = defaultProcessor(filename);
  return (config.transform || []).reduce(function(memo, item) {
    var modulePath, options = {};
    if('string' == typeof(item)) {
      modulePath = item;
    } else {
      modulePath = item[0];
      options    = item[1];
    }
    modulePath   = resolve.sync(modulePath, {basedir: dirname(pkgPath)})
    return memo.pipe(require(modulePath)(filename, options));
  }, processor)
}

function defaultProcessor() {
  return through2()
}

function getCssyConfig(pkg) {
  if(!pkg.browserify || !pkg.browserify.transform) return;
  return pkg.browserify.transform.reduce(function(memo, item) {
    if(memo) return memo;
    if(('string' == typeof(item)) || (item[0] !== 'cssy') || !item[1]) return;
    return item[1];
  }, null)
}
