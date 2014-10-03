var less = require('less');

module.exports = function(ctx, done) {

  if(!/\.less$/i.test(ctx.filename)) return done();

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
