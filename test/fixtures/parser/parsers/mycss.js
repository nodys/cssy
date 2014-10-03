// Basic parser for stylus sources
module.exports = function(ctx, done) {

  // Work for *.mycss
  if(!/\.(mycss)$/i.test(ctx.filename)) return done();

  // Fake mycss (stylus)
  var style = require('stylus')(ctx.src)
    .set('filename', ctx.filename)
    .set('sourcemap', {});

  style.render(function(err, css) {
    ctx.src = css;
    ctx.map = style.sourcemap;
    done(null, ctx)
  })
}
