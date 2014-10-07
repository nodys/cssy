// Basic parser for sass/scss sources
module.exports = function(ctx, done) {
  if(!/\.(sass|scss)$/i.test(ctx.filename)) return done();

  var sass;

  // Let user manage sass version
  try {
    sass = require('node-sass')
  } catch(e) {
    throw new Error('You must install node-sass package to use sass/scss sources')
  }

  var stats = {};
  sass.render({
    file           : ctx.filename,
    sourceComments : 'map',
    stats          : stats,
    success: function(css) {
      ctx.src = css.split('\n').slice(0,-1).join('\n') // Remove sourceUrl comment ...
      ctx.map = JSON.parse(stats.sourceMap)
      done(null, ctx)
    },
    error: function(err) {
      done(err);
    }
  })
}
