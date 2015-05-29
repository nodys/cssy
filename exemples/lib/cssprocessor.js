var autoprefixer = require('autoprefixer')
var postcss = require('postcss')

module.exports = function (ctx, done) {
  var result = postcss()
    .use(autoprefixer.postcss)
    .process(ctx.src, {map: {prev: ctx.map } })

  ctx.src = result.css
  ctx.map = result.map.toJSON()

  done(null, ctx)
}
