
module.exports = function(css, uid, imports, cssyio) {



  function cssy() {
    return cssy.insert.apply(null, arguments)
  }

  cssy.insert = function(to) {
    var imported = imports.map(function(imp) {
      var el = imp.cssy.insert(to);
      el.setAttribute('data-cssy-uid-parent', uid)
      if(imp.media) {
        el.setAttribute('media', imp.media)
      }
      return el;
    })

    var el = cssy.create();
    to = to || document.getElementsByTagName('head')[0];
    cssy.remove(to)
    to.appendChild(el);
    return el;
  }

  cssy.remove = function(from) {
    from = from || document.getElementsByTagName('head')[0];
    [].slice.apply(from.querySelectorAll("style[data-cssy-uid='"+uid+"']"))
    .forEach(function(e) {
      e.remove()
    })
  }

  cssy.create = function() {
    var el = document.createElement('style');
    el.setAttribute('type', 'text/css');
    el.setAttribute('data-cssy-uid', uid)

    function update(css) {
      if (el.styleSheet) {
        el.styleSheet.cssText = css;
      } else {
        el.textContent = css;
      }
    }

    update(css)

    cssy.onChange(function(data) {
      if(el.parentNode) update(data.code)
    })

    return el;
  }


  cssy.onChange = function(listener) {
    cssyio && cssyio.on('change:' + uid, listener)
  }

  cssy.offChange = function(listener) {
    cssyio && cssyio.off('change:' + uid, listener)
  }

  cssy.src = css;


  return cssy;
}
