var through2        = require('through2')
var crypto          = require('crypto')
var socketio        = require('socket.io')
var chokidar        = require('chokidar')
var http            = require('http')
var https           = require('https')
var debug           = require('debug')('cssy')
var WebSocketServer = require('websocket').server;
var resolve         = require('path').resolve
var concatStream    = require('concat-stream')
var fs              = require('fs')
var resin           = require('topcoat-resin')


module.exports = cssy;


// Keep file / options / processor
var fileStore = {};


function cssy(filename, options) {
  options = options || {};
  if (options.match) {
    if(!(new RegExp(options.match)).test(filename)) {
      return through2()
    }
  } else if (!/\.css$/i.test(filename)) {
    return through2()
  }

  var hash = crypto.createHash('md5').update(filename).digest('hex')

  var src = '';
  return through2(
    function (chunk, encoding, next) {
      src += chunk.toString();
      next()
    },
    function (done) {
      this.push("module.exports = (require('"+__dirname+"'))(" + JSON.stringify(src) + ", '"+hash+"')");
      done();
    }
  )
}


function processor(filename, options) {

}


cssy.attachServer = function(server, options) {
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

  function changed(filename, url) {
    filename = resolve(filename)
    var hash = crypto.createHash('md5').update(filename).digest('hex')

    debug('changed', filename, hash)
    fs.createReadStream(filename)
    .pipe(concatStream(function(source) {
      broadcast('change', {
        hash: hash,
        url: url,
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
