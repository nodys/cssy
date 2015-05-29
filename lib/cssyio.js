// Export a basic live-reload (lrio) client instance for cssy
var client = module.exports = require('lrio')('cssy')
client.on('message', function (data) {
  client.emit(data.type + ':' + data.uid, data.src)
})
