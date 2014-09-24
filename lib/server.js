var debug            = require('debug')('cssy')
var WebSocketServer  = require('websocket').server;
var pathResolve      = require('path').resolve
var concatStream     = require('concat-stream')
var createReadStream = require('fs').createReadStream
var processor        = require('./processor')

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
    var proc = processor(filename);

    if(!proc) return;

    createReadStream(filename)
    .pipe(concatStream(function(source) {

      var debugcss = require('debug').enabled('cssy')
      var result   = proc(source.toString())
      var uid      = result.uid
      var source   = result.toString({sourcemap: debugcss})

      debug('changed', filename, uid)

      broadcast('change', {
        uid  : uid,
        code : source
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
