// Basic parser for less sources
module.exports = function(ctx, done) {
  if(!/\.less$/i.test(ctx.filename)) return done();

  // Let user manage stylus version
  try {
    less = require('less')
  } catch(e) {
    throw new Error('You must install less package to use less sources')
  }

  var parser = new(less.Parser)({
    filename: ctx.filename
  })

  parser.parse(ctx.src, function (err, tree) {
    if(err) return done(err);
    ctx.src = tree.toCSS({
      sourceMap: true,
      writeSourceMap: function(map) { ctx.map = map }
    })
    done(null, ctx)
  })
}
