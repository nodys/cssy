var crypto           = require('crypto')
var relative         = require('path').relative
var convertSourceMap = require('convert-source-map')
var extend           = require('extend')

exports.getUid = function(path) {
  path = relative(process.cwd(), path);
  return crypto.createHash('md5').update(path).digest('hex')
}

exports.sourcemapToComment = function(map) {
  var content = convertSourceMap.fromObject(map).toBase64();
  return '/*# sourceMappingURL=data:application/json;base64,' + content + ' */';
}

exports.getGlobalConfig = function() {
  var debugEnabled = require('debug').enabled('cssy');
  return extend({
    compress:   !debugEnabled,
    sourcemap:  debugEnabled,
    livereload: debugEnabled
  }, (process.cssy && process.cssy.config) ? process.cssy.config : {})

}
