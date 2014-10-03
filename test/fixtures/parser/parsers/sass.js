var sass = require('node-sass')

module.exports = function(ctx, done) {

  if(!/\.sass$/i.test(ctx.filename)) return done();

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
