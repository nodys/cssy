#!/usr/bin/env node

var docflux  = require('docflux')
var concat   = require('concat-stream')
var async    = require('async')
var fs       = require('fs')
var resolve  = require('path').resolve

var DEPTH    = process.env.DEPTH || 2;
var INDENT   = process.env.INDENT ? true : false;

// Run
async.series({
  CssyBrowser: flux('../src/cssy-browser.js'),
  readme:      read('../readme.md'),
}, function(err, results) {
  fs.writeFile(
    resolve(__dirname, '../readme.md'),
    substitute(results, results.readme),
    function(err) {
      if(err) throw err;
    })
})


/**
 * Return a docflux transformer function
 *
 * @param  {String} path
 *         Code source to read (relative path)
 *
 * @return {Function}
 *         Function for async.js
 */
function flux(path) {
  return function(done) {
    fs.createReadStream(resolve(__dirname, path))
      .pipe(docflux())
      .pipe(docflux.markdown({depth:DEPTH, indent: INDENT}))
      .pipe(concat(function(data) {
        done(null, data.toString())
      }))
  }
}

/**
 * Read a source (return an async reader function)
 *
 * @param  {String} path
 *         Relative source path
 *
 * @return {Function}
 *         Function for async.js
 */
function read(path) {
  return function(done) {
    fs.createReadStream(resolve(__dirname, path))
      .pipe(concat(function(data) {
        done(null, data.toString())
      }))
  }
}

/**
 * Substitute each START / END pattern in source
 *
 * Search for `<!-- START Key -->.*<!-- END Key -->` and
 * substitute `.*` by the source in data[Key]
 *
 * Useful in markdown content to replace some generated parts
 *
 * @param  {Object} data
 *         Value for substitution
 *
 * @param  {String} source
 *         Source where to search pattern
 *
 * @return {String} Resulting source
 */
function substitute(data, source) {
  var inside;
  var out = [];
  source.split('\n').forEach(function(line) {
    var match;
    if(inside) {
      match = (new RegExp('<!--\\s+END\\s+('+inside+')\\s+-->')).exec(line)
      if(match) {
        out.push('<!-- START '+inside+' -->\n\n' +data[inside]+ '\n\n<!-- END '+inside+' -->')
        inside    = null
      }
    } else {
      match = /<!--\s+START\s+(\w+)\s+-->/.exec(line)
      if(match && data[match[1]]) {
        inside = match[1]
      } else {
        out.push(line);
      }
    }
  })
  return out.join('\n');
}
