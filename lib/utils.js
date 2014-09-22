var crypto          = require('crypto')
var debug           = require('debug')('cssy')
var through2        = require('through2')
var dirname         = require('path').dirname
var relativePackage = require('relative-package')
var resolve         = require('resolve')
var relative        = require('path').relative
var rework          = require('rework')
var combiner        = require('stream-combiner')

exports.pathHash = function(path) {
  path = relative(process.cwd(), path);
  return crypto.createHash('md5').update(path).digest('hex')
}


exports.processorFor = function(filename) {
  var pkgPath      = relativePackage(filename)
  var pkg          = require(pkgPath)
  var config       = getCssyConfig(pkg) || {};

  config.match     = config.match || ['\\.css$', 'i'];
  if(!Array.isArray(config.match)) {
    config.match = [config.match]
  }

  config.transform = config.transform || [];
  config.plugins   = config.plugins || [];

  if(!(RegExp.apply(null, config.match)).test(filename)) {
    return;
  }

  var transforms = [];

  // Add rework plugins
  var src = '';
  transforms.push(through2(
    function (chunk, encoding, next) {
      src += chunk.toString();
      next()
    },
    function (done) {
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

      if(require('debug').enabled('cssy:live')) {
        src    = rw.toString({sourcemap: true});
        src   += '\n/*# sourceURL=' + filename  + '*/'
      } else {
        src    = rw.toString();
      }

      this.push(src);
      done();
    }
  ))

  // Add other transforms
  config.transform.forEach(function(item) {
    var tranfo, options = {}, resOpt = {basedir: dirname(pkgPath)};
    if('string' == typeof(item)) {
      tranfo = item;
    } else {
      tranfo  = item[0];
      options = item[1];
      if('string' == typeof(options)) {
        options = resolve.sync(options, resOpt)
      }
    }
    tranfo   = resolve.sync(tranfo, resOpt)
    transforms.push(require(tranfo)(filename, options));
  })


  // Return a combined transform stream
  return combiner.apply(null, transforms);
}


function getCssyConfig(pkg) {
  if(!pkg.browserify || !pkg.browserify.transform) return;
  return pkg.browserify.transform.reduce(function(memo, item) {
    if(memo) return memo;
    if(('string' == typeof(item)) || (item[0] !== 'cssy') || !item[1]) return;
    return item[1];
  }, null)
}
