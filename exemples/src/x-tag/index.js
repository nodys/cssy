
var layout = require('./layout.html')
var style  = require('./style.css')

var Proto  = module.exports = Object.create(HTMLElement.prototype);


Proto.createdCallback = function() {
  var shadow = this.createShadowRoot();
  var outer  = document.createElement('div');
  shadow.appendChild(outer);
  style(shadow)
  layout(outer)
}

document.registerElement( 'x-tag', {prototype: Proto} )
