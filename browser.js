
module.exports = function(css, hash, cssyio) {

  function cssy() {
    return cssy.append.apply(null, arguments)
  }

  cssy.append = function(to) {
    return cssy.insert(to);
  }

  cssy.prepend = function(to) {
    return cssy.insert(to, true);
  }

  cssy.insert = function(to, prepend) {
    var el = cssy.create();
    to = to || document.getElementsByTagName('head')[0];
    cssy.remove(to)
    if(prepend) {
      to.insertBefore(el, to.childNodes[0]);
    } else {
      to.appendChild(el);
    }
    return el;
  }

  cssy.remove = function(from) {
    from = from || document.getElementsByTagName('head')[0];
    [].slice.apply(from.querySelectorAll("style[data-cssy-hash='"+hash+"']"))
    .forEach(function(e) {
      e.remove()
    })
  }

  cssy.create = function() {
    var el = document.createElement('style');
    el.setAttribute('type', 'text/css');
    el.setAttribute('data-cssy-hash', hash)

    function update(css) {
      if (el.styleSheet) {
        el.styleSheet.cssText = css;
      } else {
        el.textContent = css;
      }
    }

    update(css)

    cssy.onChange(function(data) {
      if(el.parentNode) update(data.source)
    })

    return el;
  }


  cssy.onChange = function(listener) {
    cssyio && cssyio.on('change:' + hash, listener)
  }

  cssy.offChange = function(listener) {
    cssyio && cssyio.off('change:' + hash, listener)
  }

  cssy.src = css;


  return cssy;
}
