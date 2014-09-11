
module.exports = CssyIO;

function CssyIO() {
  var self       = this;
  this.listeners = {};
  this.init();
}

CssyIO.prototype.init = function() {
  var self    = this;
  var loc     = document.location;

  function connectSocket() {
    var remote  = (loc.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + loc.host + '/';
    var socket  = new WebSocket(remote, 'cssy-protocol')
    socket.onmessage = function(event) {
      var message = JSON.parse(event.data);
      switch(message.type) {
        case 'change':
          self.trigger('change:' + message.data.hash, message.data)
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

}

CssyIO.prototype.trigger = function (event, data) {
  this.listeners[event] = this.listeners[event] || [];
  this.listeners[event].forEach(function(listener) {
    listener.call(null, data)
  })
}

CssyIO.prototype.on = function (event, listener) {
  this.listeners[event] = this.listeners[event] || [];
  this.listeners[event].push(listener);
}

CssyIO.prototype.off = function (event, listener) {
  if(!this.listeners[event]) return;
  this.listeners[event] = this.listeners[event].filter(function(_listener) {
    return listener !== _listener
  })
}
