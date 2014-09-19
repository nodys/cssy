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
  var pkgPath    = relativePackage(filename)
  var pkg        = require(pkgPath)
  var config     = getCssyConfig(pkg) || {};

  var transforms = [through2()];

  (config.transform || []).forEach(function(item) {
    var modulePath, options = {};
    if('string' == typeof(item)) {
      modulePath = item;
    } else {
      modulePath = item[0];
      options    = item[1];
    }
    modulePath   = resolve.sync(modulePath, {basedir: dirname(pkgPath)})
    transforms.push(require(modulePath)(filename, options));
  })

  // // Add standard transform:
  // if(!config.noDefaultTransform) {
  //   transforms.push(function() {
  //
  //   })
  // }


  return combiner.apply(null, transforms);

    //   imprt = require('rework-npm'),
    // dedupe = require('rework-deduplicate'),
    // vars = require('rework-vars'),
    // inherit = require('rework-inherit'),
    // namespace = require('rework-namespace'),
    // autoprefixer = require('autoprefixer'),


  // var processor = defaultProcessor(filename);
  // return (config.transform || []).reduce(function(memo, item) {
  //   var modulePath, options = {};
  //   if('string' == typeof(item)) {
  //     modulePath = item;
  //   } else {
  //     modulePath = item[0];
  //     options    = item[1];
  //   }
  //   modulePath   = resolve.sync(modulePath, {basedir: dirname(pkgPath)})
  //   return memo.pipe(require(modulePath)(filename, options));
  // }, processor)
}

// function defaultProcessor(filename) {
//   var src = '';
//   return through2(
//     function (chunk, encoding, next) {
//       src += chunk.toString();
//       next()
//     },
//     function (done) {
//       var rw = rework(src, {'source':filename});
//       if(require('debug').enabled('cssy:live')) {
//         src    = rw.toString({sourcemap: true});
//         src   += '\n/*# sourceURL=' + filename  + '*/'
//       } else {
//         src    = rw.toString();
//       }
//       this.push(src);
//       done();
//     }
//   )
// }

function getCssyConfig(pkg) {
  if(!pkg.browserify || !pkg.browserify.transform) return;
  return pkg.browserify.transform.reduce(function(memo, item) {
    if(memo) return memo;
    if(('string' == typeof(item)) || (item[0] !== 'cssy') || !item[1]) return;
    return item[1];
  }, null)
}
