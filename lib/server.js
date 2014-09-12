var debug            = require('debug')('cssy')
var WebSocketServer  = require('websocket').server;
var pathResolve      = require('path').resolve
var concatStream     = require('concat-stream')
var createReadStream = require('fs').createReadStream
var pathHash         = require('./utils').pathHash
var processorFor     = require('./utils').processorFor

module.exports = function(server, options) {
  options = options || {};
  var wsServer = new WebSocketServer({ httpServer: server, autoAcceptConnections: false })
  var clients  = [];

  function checkRequest(request) {
    if(request.requestedProtocols[0] != 'cssy-protocol') return false;
    return true;
  }

  wsServer.on('request', function(request) {
    if (!checkRequest(request)) {
      debug('ws: reject request %s', request.origin)
      return request.reject();
    }
    var connection = request.accept('cssy-protocol', request.origin);
    debug('ws: Peer connected %s', connection.remoteAddress)
    clients.push(connection);


    connection.on('close', function(reasonCode, description) {
      clients = clients.filter(function(client) {
        return client !== connection;
      })
      debug('ws: Peer disconnected %s', connection.remoteAddress)
    })
  })

  function broadcast(type, data) {
    var message = JSON.stringify({type: type, data: data})
    clients.forEach(function(client) {
      client.sendUTF(message);
    })
  }

  function changed(filename) {
    filename = pathResolve(filename)
    var hash = pathHash(filename)

    debug('changed', filename, hash)

    // TODO: Add processor and pipe it instead of concat ...
    createReadStream(filename)
    .pipe(processorFor(filename))
    .pipe(concatStream(function(source) {
      broadcast('change', {
        hash: hash,
        // url:  '/hash...',
        source: source.toString()
      })
    }))
  }

  server.on('request', function(req, res) {
    if(req.method != 'HEAD' || res.headersSent) return;
    res.setHeader('X-Cssyio', 'enabled')
  })

  return {
    changed: changed
  }
}
