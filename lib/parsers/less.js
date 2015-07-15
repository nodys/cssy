var semver = require('semver')

// Basic parser for less sources
module.exports = function (ctx, done) {
  if (!/\.less$/i.test(ctx.filename)) return done()

  var less, pkg
  // Let user manage stylus version
  try {
    less = require('less')
    pkg = require('less/package.json')
  } catch(e) {
    throw new Error('You must install less package to use less sources ('+e.message+')')
  }

  if (semver.lt(pkg.version, '2.0.0')) {
    var parser = new less.Parser({
      filename: ctx.filename
    })

    parser.parse(ctx.src, function (err, tree) {
      if (err) return done(err)
      ctx.src = tree.toCSS({
        sourceMap: true,
        writeSourceMap: function (map) { ctx.map = map }
      })
      done(null, ctx)
    })

  // Starting from v2.0.0
  } else {
    var options = {
      filename: ctx.filename,
      sourceMap: true
    }
    less.render(ctx.src, options, function (err, result) {
      if (err) return done(err)
      ctx.src = result.css
      ctx.map = result.map
      done(null, ctx)
    })
  }

}
