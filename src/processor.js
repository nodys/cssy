var dirname         = require('path').dirname
var pathRelative    = require('path').relative
var relativePackage = require('relative-package')
var resolve         = require('resolve')
var exists          = require('fs').existsSync
var async           = require('async')
var postcss         = require('postcss')
var pathResolve     = require('path').resolve


module.exports = processor;

function processor(filename) {

  if(!exists(filename)) return;

  // Filename always relative to cwd
  var filename     = pathRelative(process.cwd(), pathResolve(filename))

  // Package.json relative to filename
  var pkgPath      = relativePackage(pathResolve(filename))
  var pkg          = require(pkgPath)

  // Cssy config
  var config       = getCssyConfig(pkg) || {};

  config.match     = config.match || ['\\.css$', 'i'];
  if(!Array.isArray(config.match)) {
    config.match = [config.match]
  }

  config.plugins   = config.plugins || [];
  if(!(RegExp.apply(null, config.match)).test(filename)) {
    return;
  }

  return function(src, done) {


    // Transform source
    async.waterfall([
      // 1. Initialize context
      function(next)      {
        var ctx = {
          config   : config,
          filename : filename,
        }

        // Generate base source-map
        var result = postcss()
          .process(src, {
            map            : {
              sourcesContent : true,
              annotation     : false
            },
            from : ctx.filename
          })
        ctx.src = result.css;
        ctx.map = result.map.toJSON();
        next(null, ctx)
      },

      // 2. Perform all global pre-processor on context
      function(ctx, next) {
        if(process.cssy.preProcessors.length) {
          (async.seq.apply(null, process.cssy.preProcessors))(ctx, next)
        } else {
          return next(null, ctx)
        }
      },

      // 3. Perform local processor on context
      function(ctx, next) {
        if(config.processor) {
          var localProcessor = require(resolve.sync(config.processor,  {basedir: dirname(pkgPath)} ));
          localProcessor(ctx, next);
        } else {
          next(null, ctx)
        }
      },


      // 4. Perform all global post-processor on context
      function(ctx, next) {
        if(process.cssy.postProcessors.length) {
          (async.seq.apply(null, process.cssy.postProcessors))(ctx, next)
        } else {
          return next(null, ctx)
        }
      },

      // 5. Extract importations and generate source
      function(ctx, next) {
        ctx.imports = [];

        var styles  = postcss.parse(ctx.src, {
          map : { prev : ctx.map },
        })

        // Extract imports
        if(!ctx.config.noImport) {
          styles.eachAtRule(function (atRule) {
            if (atRule.name !== "import")  return;
            if(/^url\(|:\/\//.test(atRule.params)) return;
            ctx.imports.push(parseImport(atRule.params));
            atRule.removeSelf()
          })
        }

        // Compress
        if(process.cssy.config.compress) {
          compress(styles)
        }

        // Source map
        if(process.cssy.config.sourcemap) {
          ctx.src  = styles.toResult({ map: { inline : true } }).css;
          ctx.src +=  '\n/*# sourceURL=' + ctx.filename + '.output'   + '*/';
        } else {
          ctx.src  = styles.toResult({ map: false }).css;
        }

        next(null, ctx);
      }
    ], done)

  }
}

function compress(styles) {
  styles.eachDecl(function(decl) {
    decl.before  = ""
    decl.between = ":"
  })
  styles.eachRule(function(rule) {
    rule.before  = ""
    rule.between = ""
    rule.after   = ""
  })
  styles.eachAtRule(function(atRule) {
    atRule.before  = ""
    atRule.between = ""
    atRule.after   = ""
  })
  styles.eachComment(function(comment) {
    comment.removeSelf()
  })
  styles.before = ""
  styles.after = ""
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
