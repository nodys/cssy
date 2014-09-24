var crypto           = require('crypto')
var relative         = require('path').relative
var convertSourceMap = require('convert-source-map')

exports.getUid = function(path) {
  path = relative(process.cwd(), path);
  return crypto.createHash('md5').update(path).digest('hex')
}


exports.sourcemapToComment = function(map) {
  var content = convertSourceMap.fromObject(map).toBase64();
  return '/*# sourceMappingURL=data:application/json;base64,' + content + ' */';
}
