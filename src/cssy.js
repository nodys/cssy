var async            = require('async');
var extend           = require('extend');
var concatStream     = require('concat-stream')
var createReadStream = require('fs').createReadStream
var lrio             = require('lrio')
var transform        = require('./transform.js');
var processor        = require('./processor.js');


// cssy is a browserify transform
var cssy = module.exports = transform;

cssy.transform    = transform;
cssy.processor    = processor;


cssy.reset = function() {
  var debugEnabled = require('debug').enabled('cssy');
  process.cssy                = {};
  process.cssy.postProcessors = [];
  process.cssy.preProcessors  = [];
  process.cssy.config         = {
    compress:   !debugEnabled,
    sourcemap:  debugEnabled,
    livereload: debugEnabled
  };
}


cssy.attachServer = function(server) {
  var lrioServer = lrio(server, 'cssy')

  function changed(filename) {
    var proc = processor(filename);
    if(!proc) return;
    createReadStream(filename)
    .pipe(concatStream(function(source) {
      proc(source.toString(), function(err, result) {
        lrioServer.broadcast('change', result.filename, result.src)
      })
    }))
  }

  return {
    changed: changed
  }
}

cssy.pre = function(procs) {
  if(!Array.isArray(procs)) procs = [procs];
  procs.forEach(function(proc) {
    process.cssy.preProcessors.push(proc);
  })
  return cssy;
}

cssy.post = function(procs) {
  if(!Array.isArray(procs)) procs = [procs];
  procs.forEach(function(proc) {
    process.cssy.postProcessors.push(proc);
  })
  return cssy;
}

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

cssy.reset();
