var convertSm       = require('convert-source-map')
var crypto          = require('crypto')
var debug           = require('debug')('cssy')
var dirname         = require('path').dirname
var relative        = require('path').relative
var relativePackage = require('relative-package')
var resolve         = require('resolve')
var rework          = require('rework')
var exists          = require('fs').existsSync
var async           = require('async')
var postcss         = require('postcss')
var basename = require('path').basename

var css             = require('css');

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

  return function(css, done) {
    var relpath             =  relative(process.cwd(), filename)
    // var relpath             =  filename.slice(1)

    var globalPreProcessor  = (process.cssy && process.cssy.preProcessor)  || traverse;
    var localProcessor      = traverse;
    var globalPostProcessor = (process.cssy && process.cssy.postProcessor) || traverse;

    // Require defined processor
    if(config.processor) {
      localProcessor = require(resolve.sync(config.processor,  {basedir: dirname(pkgPath)} ))
    }

    async.waterfall([
      function(next)      {
        var ctx = {
          config   : config,
          filename : filename,
          css      : css,
          uid      : getUid(filename),
        }
        var result = postcss()
          .process(ctx.css, {
            map            : {
              sourcesContent : true,
              annotation     : false
            },
            from : ctx.filename
          })
        ctx.css = result.css;
        ctx.map = result.map.toJSON();

        next(null, ctx)
      },
      function(ctx, next) { globalPreProcessor(ctx,  next)  },
      function(ctx, next) { localProcessor(ctx, next)       },
      function(ctx, next) { globalPostProcessor(ctx, next)  },
      function(ctx, next) {
        ctx.imports = [];

        var styles  = postcss.parse(ctx.css, {
          map : { prev : ctx.map },
        })

        if(!ctx.config.noImport) {
          styles.eachAtRule(function (atRule) {
            if (atRule.name !== "import")  return;
            if(/^url\(|:\/\//.test(atRule.params)) return;
            ctx.imports.push(parseImport(atRule.params));
            atRule.removeSelf()
          })
        }

        var result = styles.toResult({
          map: {
            inline         : true
          }
        })

        ctx.css  = result.css;
        ctx.css +=  '\n/*# sourceURL=' + ctx.uid   + '*/';

        next(null, ctx);
      }
    ], done)

  }
}



function traverse(src, callback) {
  callback(null, src);
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
