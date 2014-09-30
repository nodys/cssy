var async            = require('async');
var extend           = require('extend');
var concatStream     = require('concat-stream')
var createReadStream = require('fs').createReadStream
var lrio             = require('lrio')
var transform        = require('./transform.js');
var processor        = require('./processor.js');


// cssy is a browserify transform
var cssy = module.exports = transform;

// Export api
cssy.transform    = transform;
cssy.processor    = processor;

/**
 * Add a global cssy pre-processor
 *
 * @param  {Array/Function} procs
 *         A processor function or an array of functions
 * @return {cssy}
 */
cssy.pre = function(procs) {
  if(!Array.isArray(procs)) procs = [procs];
  procs.forEach(function(proc) {
    process.cssy.preProcessors.push(proc);
  })
  return cssy;
}

/**
 * Add a global cssy post-processor
 *
 * @param  {Array/Function} procs
 *         A processor function or an array of functions
 * @return {cssy}
 */
cssy.post = function(procs) {
  if(!Array.isArray(procs)) procs = [procs];
  procs.forEach(function(proc) {
    process.cssy.postProcessors.push(proc);
  })
  return cssy;
}


/**
 * Attach a cssy live-reload server to a given http-server
 *
 * This must be used on for development purpose only: Attaching a cssy
 * live-reload server add a live-reload client to generated sources.
 *
 * cssy.attachServer() use cssy.config() to enable client liverload, sourcemap
 * and disable compression. Use cssy.config() after cssy.attachServer()
 * to disable sourcemap or enable compression
 *
 * Exemple with chokidar:
 *
 *     var chokidar     = require('chokidar');
 *     var cssy         = require('cssy');
 *     var server       = require('http').createServer();
 *
 *     if(process.env.NODE_ENV === 'development') {
 *       var cssyListener = css.attachServer(server);
 *       chokidar.watch('./src').on('change', cssyListener);
 *     }
 *
 * @param {Object} server
 *        A node http / https server
 *
 * @return {Function}
 *        A change listener (take one argument: the filename that changed)
 */
cssy.attachServer = function(server) {
  var lrioServer = lrio(server, 'cssy')

  cssy.config({
    compress:   false,
    sourcemap:  true,
    livereload: true
  });

  function change(filename) {
    var proc = processor(filename);
    if(!proc) return;
    createReadStream(filename)
    .pipe(concatStream(function(source) {
      proc(source.toString(), function(err, result) {
        lrioServer.broadcast('change', result.filename, result.src)
      })
    }))
  }

  change.lrioServer = lrioServer;

  return change;
}


/**
 * Global config getter/setter
 *
 * Global configuration options:
 *
 * - `compress`: Compress source (remove comments and spaces)
 * - `sourcemap`: Enable source-map
 * - `livereload`: Enable livereload (enabled by cssy.attachServer())
 *
 *
 * @param  {String/Objext} key
 *         cssy config key or an object to merge with global config
 *
 * @param  {Mixed} value
 *         Config value
 *
 * @return {Mixed}
 */
cssy.config = function(key, value) {
  if('object' == typeof(key)) {
    process.cssy.config = extend(process.cssy.config, key);
    return cssy;
  }
  if('undefined' != typeof(value)) {
    process.cssy.config[key] = value
  }
  return process.cssy.config[key]
}


/**
 * Reset cssy global configuration
 */
cssy.reset = function() {
  process.cssy                = {};
  process.cssy.postProcessors = [];
  process.cssy.preProcessors  = [];
  process.cssy.config         = {
    compress:   true,
    sourcemap:  false,
    livereload: false
  };
}

// Reset once if needed
if(!process.cssy) {
  cssy.reset();
}
