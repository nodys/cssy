var dirname         = require('path').dirname
var pathRelative    = require('path').relative
var relativePackage = require('relative-package')
var resolve         = require('resolve')
var exists          = require('fs').existsSync
var async           = require('async')
var postcss         = require('postcss')
var pathResolve     = require('path').resolve
var readFileSync    = require('fs').readFileSync
var csswring        = require('csswring')
var extname         = require('path').extname
var compose         = require('./utils').compose
var toAsync         = require('./utils').toAsync
var getCssyConfig   = require('./utils').getCssyConfig
var extend          = require('extend')
var cssyParsers     = require('./parsers')


module.exports = getProcessor;

/**
 * Provide a source processor for the given filename
 *
 * @param  {String} filename
 *         File path of the source to process
 *
 * @return {Function}
 *         An asynchronous processing function with two arguments: A css source
 *         to process and a standard node callback (err, result)
 *         This function return a cssy context object with:
 *         - `filename` : the source filename
 *         - `src` : the processed source
 *         - `map` : the standard source map object
 *         - `imports` : array of sources to import:
 *            - `path`:  The path relative to the source
 *            - `media`: The css media query
 */
function getProcessor(filename, config) {

  if(!exists(filename)) return;

  // Filename always relative to cwd
  var filename  = pathRelative(process.cwd(), pathResolve(filename))

  // Package.json relative to filename
  var pkgPath   = relativePackage(pathResolve(filename))

  // Cssy config
  config        = config || getCssyConfig(pkgPath);

  config.basedir = config.basedir || dirname(pkgPath);

  // Check if cssy should handle this source
  config.match     = config.match || ['\\.(css|sass|scss|less|styl)$', 'i'];

  if(!(config.match instanceof RegExp)) {
    config.match  = RegExp.apply(null, Array.isArray(config.match) ? config.match : [config.match])
  }

  if(!(config.match).test(filename)) {
    return;
  }

  // List local parsers according to config (concat with internal cssy parsers):
  var parsers = resolveFunctionList(config.parsers || config.parser, config.basedir).concat(cssyParsers)

  // List local processors according to config:
  var localProcessors = resolveFunctionList(config.processors || config.processor, config.basedir);


  function handle(src, done) {


    // Transform source
    async.waterfall([
      // 1. Parse source
      function(next)      {
        var ctx = {
          config   : config,
          filename : filename,
          src      : src
        }

        // Fake map for empty source
        if(ctx.src.trim() == '') {
          ctx.src = '';
          ctx.map = {
            version  : 3,
            sources  : [ctx.filename],
            names    : [],
            mappings : 'A',
            file     : 'to.css'
          }
          next(null, ctx);
        } else {

          var newCtx;
          async.detectSeries(
            parsers,
            function(parser, callback) {
              parser(extend({}, ctx), function(err, result) {
                if(err)      return done(err)
                if(!result || !result.map) {
                  return callback(false);
                } else {
                  newCtx = result;
                  return callback(true);
                }
              })
            },
            function(found) {
              if(found) {
                next(null, newCtx)
              } else {
                parseCss(ctx, next)
              }
            }
          )

        }

      },

      // 2. Parse css source
      // parseCss,

      // 3. Perform all global pre-processor on context
      compose(process.cssy.preProcessors),

      // 4. Perform local processor on context
      compose(localProcessors),

      // 5. Perform all global post-processor on context
      compose(process.cssy.postProcessors),

      // 6. Extract importations and generate source
      function(ctx, next) {
        ctx.imports = [];

        var styles  = postcss.parse(ctx.src, {
          map : { prev : ctx.map },
        })

        // Extract imports
        if(!ctx.config.noImport) {
          styles.eachAtRule(function (atRule) {
            if (atRule.name !== "import")  return;
            if(/^url\(|:\/\//.test(atRule.params)) return; // Absolute
            ctx.imports.push(parseImport(atRule.params))
            atRule.removeSelf()
          })

        }

        // Minify ?
        if(process.cssy.config.minify) {
          csswring.postcss(styles)
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

  return handle;
}

/**
 * Default source parser for css source
 *
 * @param {Object}   ctx
 *        Cssy context object with source
 *
 * @param {Function} done
 *        Async callback
 */
function parseCss(ctx, done) {
  var result;
  try {
    result = postcss()
      .process(ctx.src, {
        map            : {
          sourcesContent : true,
          annotation     : false,
          prev           : ctx.map
        },
        from : ctx.filename
      })
    ctx.src = result.css;
    ctx.map = result.map.toJSON();
    done(null, ctx)
  } catch(e) {
    var msg = e.message;
    var ext = extname(ctx.filename).slice(1).toLowerCase();
    if(ext != 'css') {
      msg += ' (Try to use appropriate parser for '+ ext + ')';
    }
    done(new Error(msg))
  }
}

/**
 * Resolve and require a list of module path that exports async function
 *
 * Each path is resolved against `basedir`. `utils.toAsync()` unsure that
 * each function will work as async function.
 *
 * @param {Array|String} functionList
 *        Module path or array of module path
 *
 * @param {String} basedir
 *        Base path for path resolution (dirname of the package.json)
 *
 * @return {Array}
 *         An array of cssy asynchronous functions
 */
function resolveFunctionList(functionList, basedir) {
  if(!functionList) return [];
  return (Array.isArray(functionList) ? functionList : [functionList])
    .map(function(proc) {
      if(typeof(proc) == 'string') {
        proc = require(resolve.sync(proc,  { basedir: basedir } ))
      }
      return toAsync(proc);
    })
}


/**
 * Read a css import arguments: extract filepath and css media query
 *
 * @param {string} imp
 *        The import arguments
 *        (expl: `'./path/to.css' (min-width: 700px) and (orientation: landscape)` )
 */
function parseImport(imp) {
  var re = /^['"]?([^\s'"]+)['"]?\s*(.*)$/;
  var result = re.exec(imp);
  return {
    path:  result[1],
    media: result[2].trim()
  }
}
