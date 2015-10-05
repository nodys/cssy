// Basic parser for stylus sources
module.exports = function (ctx, done) {
  if (!/\.styl$/i.test(ctx.filename)) {
    return done()
  }

  var stylus

  // Let user manage stylus version
  try {
    stylus = require('stylus')
  } catch (e) {
    throw new Error('You must install stylus package to use stylus sources (' + e.message + ')')
  }

  var style = stylus(ctx.src)
    .set('filename', ctx.filename)
    .set('sourcemap', {})

  style.render(function (err, css) {
    if (err) {
      return done(err)
    }
    ctx.src = css
    ctx.map = style.sourcemap
    done(null, ctx)
  })
}
