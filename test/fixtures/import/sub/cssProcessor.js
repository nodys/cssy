
var customProperties = require('postcss-custom-properties')
var postcss = require('postcss')

module.exports = function (ctx, done) {
  var result = postcss()
    .use(customProperties())
    .process(ctx.src, {
      map: { prev: ctx.map }
    })

  ctx.src = result.css
  ctx.map = result.map.toJSON()

  done(null, ctx)
}
