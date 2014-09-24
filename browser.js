
module.exports = function(css, uid, imports, cssyio) {

  function cssy() {
    return cssy.insert.apply(null, arguments)
  }

  cssy.insert = function(to) {

    var imported = imports.map(function(imp) {
      var sub = imp.cssy(to);
      if(imp.media) {
        sub.element.setAttribute('media', imp.media)
      }
      return sub;
    })

    var element = document.createElement('style');
    element.setAttribute('type', 'text/css');
    to = to || document.getElementsByTagName('head')[0];
    to.appendChild(element);

    function update(css) {
      if (element.styleSheet) {
        element.styleSheet.cssText = css;
      } else {
        element.textContent = css;
      }
    }

    function remove() {
      cssy.offChange(listener);
      element.remove();
      imported.forEach(function(sub) {
        sub.remove();
      })
    }

    function listener(data) {
      update(data.code)
    }

    // Initialize:
    update(css)
    cssy.onChange(listener)

    return {
      element: element,
      remove:  remove,
      update:  update
    }
  }

  cssy.onChange = function(listener) {
    cssyio && cssyio.on('change:' + uid, listener)
  }

  cssy.offChange = function(listener) {
    cssyio && cssyio.off('change:' + uid, listener)
  }

  cssy.src = css;

  cssy.onChange(function(data) {
    cssy.src = data.code;
  })

  return cssy;
}
