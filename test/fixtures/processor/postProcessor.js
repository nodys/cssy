module.exports = function(ctx) {
  ctx.src = ctx.src + '/* postProcessor */';
  return ctx;
}
