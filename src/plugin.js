

module.exports = function(b, config) {

  var cssy   = require('./cssy')
  var nocssy = require('./nocssy')

  // Read configuration:
  cssy.pre(config.pre   || []);
  cssy.post(config.post || [])

  if(config.live) {
    cssy.live(config.live) // Attach a server instance
  }

  if('undefined' != typeof(config.minify)) {
    cssy.config({minify: config.minify} );
  }

  if('undefined' != typeof(config.sourcemap)) {
    cssy.config({sourcemap: config.sourcemap});
  }

  if(config.nocssy) {
    b.plugin(nocssy, config.nocssy)
  }

}
