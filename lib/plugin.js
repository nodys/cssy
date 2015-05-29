module.exports = function (b, config) {
  var cssy = require('./cssy')
  var remedy = require('./remedy')

  // Read configuration:
  cssy.pre(config.pre || [])
  cssy.post(config.post || [])

  if (config.live) {
    cssy.live(config.live) // Attach a server instance
  }

  if (typeof (config.minify) !== 'undefined') {
    cssy.config({minify: config.minify})
  }

  if (typeof (config.sourcemap) !== 'undefined') {
    cssy.config({sourcemap: config.sourcemap})
  }

  if (config.remedy) {
    b.plugin(remedy, config.remedy)
  }
}
