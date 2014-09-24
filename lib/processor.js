var convertSm       = require('convert-source-map')
var crypto          = require('crypto')
var debug           = require('debug')('cssy')
var dirname         = require('path').dirname
var relative        = require('path').relative
var relativePackage = require('relative-package')
var resolve         = require('resolve')
var rework          = require('rework')
var exists          = require('fs').existsSync

var css              = require('css');

module.exports = processor;

function processor(filename) {

  if(!exists(filename)) return;

  var pkgPath      = relativePackage(filename)
  var pkg          = require(pkgPath)
  var config       = getCssyConfig(pkg) || {};

  config.match     = config.match || ['\\.css$', 'i'];
  if(!Array.isArray(config.match)) {
    config.match = [config.match]
  }

  config.plugins   = config.plugins || [];

  if(!(RegExp.apply(null, config.match)).test(filename)) {
    return;
  }

  return function(src) {

    var rw      = rework(src, {'source':filename});

    config.plugins.forEach(function(item) {
      var plugin, options, resOpt = {basedir: dirname(pkgPath)};

      if('string' == typeof(item)) {
        plugin = item;
      } else {
        plugin = item[0];
        options    = item[1];
        if('string' == typeof(options)) {
          options = require(resolve.sync(options, resOpt))
        }
      }
      plugin = require(resolve.sync(plugin, resOpt));

      if(options) {
        plugin = plugin(options);
      }
      rw     = rw.use(plugin)
    })

    var imports = [];
    rw.use(function(style) {
      style.rules = style.rules.filter(function(rule) {
        if(rule.type !== 'import')    return true;
        if(/^url\(|:\/\//.test(rule.import)) return true;
        imports.push(parseImport(rule.import));
        return false;
      })
    })

    rw.imports  = imports;
    rw.uid      = getUid(filename)
    rw.toString = function(options) {
      options = options || {};
      var result = css.stringify(rw.obj, options);
      if (options.sourcemap && !options.sourcemapAsObject) {
        result = result.code +
          '\n' + smToComment(result.map) +
          '\n/*# sourceURL=' + filename  + '*/';
      }
      return result;
    }

    return rw;
  }
}

function parseImport(imp) {
  var re = /^['"]?([^\s'"]+)['"]?\s*(.*)$/;
  var result = re.exec(imp);
  return {
    path:  result[1],
    media: result[2].trim()
  }
}

function getCssyConfig(pkg) {
  if(!pkg.browserify || !pkg.browserify.transform) return;
  return pkg.browserify.transform.reduce(function(memo, item) {
    if(memo) return memo;
    if(('string' == typeof(item)) || (item[0] !== 'cssy') || !item[1]) return;
    return item[1];
  }, null)
}

function getUid(path) {
  path = relative(process.cwd(), path);
  return crypto.createHash('md5').update(path).digest('hex')
}


function smToComment(map) {
  var content = convertSm.fromObject(map).toBase64();
  return '/*# sourceMappingURL=data:application/json;base64,' + content + ' */';
}
