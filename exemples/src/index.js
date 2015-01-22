var reloader  = require('./reloader')
var domready  = require('domready')
var xTag      = require('./x-tag')

var html      = require('./html/features.html')
var styleCss  = require('./styles/style.css')
var styleLess = require('./styles/style.less')
var styleScss = require('./styles/style.scss')
var styleSass = require('./styles/style.sass')
var styleStyl = require('./styles/style.styl')
var updateMe  = require('./styles/updateme.css')


domready(function() {
  html(document.body)

  styleCss()
  styleLess()
  styleScss()
  styleSass()
  styleStyl()
  updateMe()

  setInterval(function() {
    updateMe.update('.feat.updateme::before { transition: all 2s; background-color: #'+Math.floor(Math.random()*16777215).toString(16) +'; }')
  }, 3000)

})
