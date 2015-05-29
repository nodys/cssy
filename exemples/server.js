var express = require('express')
var morgan = require('morgan')
var browserify = require('browserify')
var watchify = require('watchify')
var serveStatic = require('serve-static')
var lrio = require('lrio')
var cssy = require('cssy')
var htmly = require('htmly')
var http = require('http')
var resolve = require('path').resolve
var extend = require('extend')

// Environnement
var PORT = process.env.PORT || 3000

// Server application
var app = express()
var router = new express.Router()
var server = http.createServer(app)
var reloader = lrio(server, 'reloader')

// Use cssy live to enable live reload (use it for developement only)
cssy.live(server)
htmly.live(server) // Look 'ma there is html plugin too

// Middlewares
app.use(morgan('dev'))
app.use(router)
app.use(serveStatic(resolve(__dirname, './public')))

// Bundle application with watchify/browserify and connect a tiny live reloader
// socket for javascript sources
var bundler = watchify(browserify(extend({debug: true}, watchify.args)))
  .add(resolve(__dirname, './src/index.js'))
  .on('update', function (files) {
    if (files.some(function (f) {return /\.js$/i.test(f)})) {
      // Only if some changed files are js sources
      reloader.broadcast({files: files})
    }
  })
router.get('/bundle.js', function (req, res) {
  res.type('application/javascript')
  bundler.bundle().pipe(res)
})

// Index
router.get('/', function (req, res, next) {
  res.type('text/html')
  res.send('<!DOCTYPE html>\n<script src="/bundle.js"></script>')
})

// Start listening
server.listen(PORT, function (err) {
  if (err) throw err
  console.log('Server listen on http://localhost:%s', PORT)
})
