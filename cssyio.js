
var listeners = {}


exports.trigger = function (event, data) {
  listeners[event] = listeners[event] || [];
  listeners[event].forEach(function(listener) {
    listener.call(null, data)
  })
}

exports.on = function (event, listener) {
  listeners[event] = listeners[event] || [];
  listeners[event].push(listener);
}

exports.off = function (event, listener) {
  if(!listeners[event]) return;
  listeners[event] = listeners[event].filter(function(_listener) {
    return listener !== _listener
  })
}

function connectSocket() {
  var loc     = document.location;
  var remote  = (loc.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + loc.host + '/';
  var socket  = new WebSocket(remote, 'cssy-protocol')
  socket.onmessage = function(event) {
    var message = JSON.parse(event.data);
    switch(message.type) {
      case 'change':
        exports.trigger('change:' + message.data.hash, message.data)
        break;
    }
  }
}

function ifServerExists(callback) {
  var req = new XMLHttpRequest()
  req.onreadystatechange = function () {
    if (req.readyState === 2
      && (req.getResponseHeader('X-Cssyio') == 'enabled')) {
      callback()
    }
  }
  req.open('HEAD', document.location, true)
  req.send(null)
}

try {
  ifServerExists(connectSocket)
} catch(e) {}
