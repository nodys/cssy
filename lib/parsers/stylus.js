// Basic parser for stylus sources
module.exports = function(ctx, done) {
  if(!/\.styl$/i.test(ctx.filename)) return done();

  var stylus;

  // Let user manage stylus version
  try {
    stylus = require('stylus')
  } catch(e) {
    throw new Error('You must install stylus package to use stylus sources')
  }

  var style = stylus(ctx.src)
    .set('filename', ctx.filename)
    .set('sourcemap', {});

  style.render(function(err, css) {
    ctx.src = css;
    ctx.map = style.sourcemap;
    done(null, ctx)
  })
}
