var semver = require('semver')
var resolve = require('path').resolve

// Basic parser for sass/scss sources

module.exports = function (ctx, done) {
  if (!/\.(sass|scss)$/i.test(ctx.filename)) return done()

  var sass, pkg, stats = {}

  // Let user manage sass version
  try {
    sass = require('node-sass')
    pkg = require('node-sass/package.json')
  } catch(e) {
    throw new Error('You must install node-sass package to use sass/scss sources')
  }

  // Use semver to check version (so many breaking changes !!!)
  if (semver.lte(pkg.version, '1.1.0')) {
    sass.render({
      file: ctx.filename,
      sourceComments: 'map',
      stats: stats,
      success: function (result) {
        ctx.src = result.split('\n').slice(0, -1).join('\n') // Remove sourceUrl comment ...
        ctx.map = JSON.parse(stats.sourceMap)
        done(null, ctx)
      },
      error: done
    })
  } else if (semver.lt(pkg.version, '2.0.0-beta')) {
    sass.render({
      file: ctx.filename,
      sourceMap: true,
      stats: stats,
      outFile: resolve(ctx.filename + '.css'),
      omitSourceMapUrl: true,
      success: function (result, sourceMap) {
        ctx.src = result
        ctx.map = JSON.parse(stats.sourceMap)
        delete ctx.map.file
        done(null, ctx)
      },
      error: done
    })
  } else if (semver.lt(pkg.version, '3.0.0')) {
    sass.render({
      file: ctx.filename,
      sourceMap: true,
      stats: stats,
      outFile: resolve(ctx.filename + '.css'),
      omitSourceMapUrl: true,
      success: function (result, sourceMap) {
        ctx.src = result.css
        ctx.map = result.map
        delete ctx.map.file
        done(null, ctx)
      },
      error: done
    })
  } else {
    sass.render({
      file: ctx.filename,
      sourceMap: true,
      stats: stats,
      outFile: resolve(ctx.filename + '.css'),
      omitSourceMapUrl: true
    }, function (err, result) {
      if (err) {
        return done(err)
      }
      ctx.src = result.css
      ctx.map = result.map.toString() // Map is now a Buffer..
      delete ctx.map.file
      done(null, ctx)
    })
  }
}
