var async           = require('async');
var getGlobalConfig = require('./lib/utils').getGlobalConfig
var extend          = require('extend')

var cssy = module.exports = require('./lib/transform.js');

function init() {
  if(process.cssy) return;

  // Global cssy pre-processor:
  process.cssy = {};
  process.cssy.preProcessor = function(rw, callback) {
    (async.seq.apply(null, process.cssy.preProcessor.stack))(rw,callback)
  }
  process.cssy.preProcessor.stack = [];


  // Global cssy post-processor:
  process.cssy.postProcessor = function(rw, callback) {
    (async.seq.apply(null, process.cssy.postProcessor.stack))(rw, callback)
  }
  process.cssy.postProcessor.stack = [];

  // Global cssy config:
  process.cssy.config = getGlobalConfig() // Defaults
}

cssy.attachServer = require('./lib/server.js')

cssy.reset = function() {
  delete process.cssy;
  return cssy;
}

cssy.pre = function(procs) {
  init();
  if(!Array.isArray(procs)) procs = [procs];
  procs.forEach(function(proc) {
    process.cssy.preProcessor.stack.push(proc);
  })
  return cssy;
}

cssy.post = function(procs) {
  init();
  if(!Array.isArray(procs)) procs = [procs];
  procs.forEach(function(proc) {
    process.cssy.postProcessor.stack.push(proc);
  })
  return cssy;
}


cssy.config = function(key, value) {
  init();
  if('object' == typeof(key)) {
    process.cssy.config = extend(process.cssy.config, key);
    return cssy;
  }

  if('undefined' != typeof(value)) {
    process.cssy.config[key] = value
  }
  return getGlobalConfig()['key']
}
