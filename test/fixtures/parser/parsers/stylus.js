var stylus = require('stylus');

module.exports = function(ctx, done) {
  if(!/\.styl$/i.test(ctx.filename)) return done();

  var style = stylus(ctx.src)
    .set('filename', ctx.filename)
    .set('sourcemap', {});

  style.render(function(err, css) {
    ctx.src = css;
    ctx.map = style.sourcemap;
    done(null, ctx)
  })

}
