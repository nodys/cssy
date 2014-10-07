var async            = require('async');
var extend           = require('extend');
var concatStream     = require('concat-stream')
var createReadStream = require('fs').createReadStream
var lrio             = require('lrio')
var transform        = require('./transform.js');
var processor        = require('./processor.js');
var chokidar         = require('chokidar')
var resolve          = require('resolve').sync
var remedy           = require('./remedy')

// cssy is a browserify transform and a browserify plugin
var cssy = module.exports = module.exports = function(fileOrBrowserify, opts) {
  if('string' == typeof(fileOrBrowserify)) {
    return require('./transform')(fileOrBrowserify, opts);
  } else {
    return require('./plugin')(fileOrBrowserify, opts);
  }
}

// Export api
cssy.transform    = transform;
cssy.processor    = processor;
cssy.remedy       = remedy;

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
    if(typeof(proc) === 'string') {
      proc = require(resolve(proc, {basedir: process.cwd()}));
    }
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
    if(typeof(proc) === 'string') {
      proc = require(resolve(proc, {basedir: process.cwd()}));
    }
    process.cssy.postProcessors.push(proc);
  })
  return cssy;
}


/**
 * Add an automatic cssy live source reload on a http(s) server
 *
 * This must be used on the same process than the browserify bundler
 *
 * @param {http(s).Server} server
 *        A node http / https server
 *
 * @param {[FSWatcher]} watcher
 *        Optional: a EventEmitter watcher instance (same as chokidar.FSWatcher)
 *
 * @return {Function}
 *        A change listener (take one argument: the filename that changed)
 *
 *        With two static properties:
 *        - watcher: the chokidar instance
 *        - lrioServer: the lrio instance
 */
cssy.live = function(server, watcher) {
  if(typeof(server) === 'string') {
    server = require(resolve(server));
  }
  watcher  = watcher || (new chokidar.FSWatcher);
  var listener = cssy.attachServer(server);
  watcher.on('change', listener)
  cssy.post(function(ctx, done) { watcher.add(ctx.filename); done(null, ctx) })
  listener.watcher = watcher;
  return listener;
}

/**
 * Attach a cssy live-reload server to a given http-server
 *
 * This must be used on for development purpose only: Attaching a cssy
 * live-reload server add a live-reload client to generated sources.
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
 * @param {http(s).Server} server
 *        A node http / https server
 *
 * @return {Function}
 *        A change listener (take one argument: the filename that changed)
 *
 *        With one static property:
 *        - lrioServer: the lrio instance
 */
cssy.attachServer = function(server) {
  var lrioServer = lrio(server, 'cssy')

  process.cssy.livereload = true;

  function change(filename) {
    var proc = processor(filename);
    if(!proc) return;
    createReadStream(filename)
    .pipe(concatStream(function(source) {
      proc(source.toString(), function(err, result) {
        lrioServer.broadcast({type:'change', uid: result.filename, src: result.src})
      })
    }))
  }

  change.lrioServer = lrioServer;

  return change;
}


/**
 * Global config getter/setter
 *
 * - `minify`: Minify source
 * - `sourcemap`: Enable source-map
 *
 * @param  {[Object]}
 *         object to merge with global config
 *
 * @return {Object} current config
 */
cssy.config = function(config) {
  process.cssy.config = extend(process.cssy.config, config || {});
  return process.cssy.config
}


/**
 * Reset cssy global configuration
 */
cssy.reset = function() {
  process.cssy                = {};
  process.cssy.postProcessors = [];
  process.cssy.preProcessors  = [];
  process.cssy.livereload     = false;
  process.cssy.config         = {
    minify:     false,
    sourcemap:  true
  };
}

// Reset once if needed
if(!process.cssy) {
  cssy.reset();
}
