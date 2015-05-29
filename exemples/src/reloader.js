var lrio = require('lrio')
var reloader = lrio('reloader', {timeout: 1000})
var retry = 0

function reload () { document.location.reload() }

reloader.on('message', reload)

reloader.on('close', function () {
  setTimeout(
    function () { reloader.connect(reload) },
    Math.min(Math.pow((retry++ + 2.5) / 5, 3) * 500, 8000)
  )
})
