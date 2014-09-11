var CssyIO = require('./cssyio')

function getCssyIO() {
  return getCssyIO._cssyio = getCssyIO._cssyio || (new CssyIO())
}

module.exports = function(css, hash) {

  function cssy() {
    return cssy.append.apply(null, arguments)
  }

  cssy.append = function(to) {
    return cssy.insert(to);
  }

  cssy.prepend = function(to) {
    return cssy.prepend(to, true);
  }

  cssy.insert = function(to, prepend) {
    var el = cssy.create();
    to = to || document.getElementsByTagName('head')[0];
    if(prepend) {
      to.insertBefore(el, to.childNodes[0]);
    } else {
      to.appendChild(el);
    }
    return el;
  }

  cssy.create = function() {
    var el = document.createElement('style');
    el.setAttribute('type', 'text/css');

    function update(css) {
      if (el.styleSheet) {
        el.styleSheet.cssText = css;
      } else {
        el.textContent = css;
      }
    }

    update(css)

    if(hash) {
      getCssyIO().on('change:' + hash, function(data) {
        update(data.source)
      })
    }

    return el;
  }

  cssy.source = function() {
    return css;
  }

  cssy.onChange = function(listener) {
    if(!hash) return;
    getCssyIO().on('change:' + hash, listener)
  }



  return cssy;
}
