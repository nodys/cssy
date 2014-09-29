
module.exports = function(src, imports) {

  var changeListeners = [];

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

    function update(src) {
      if (element.styleSheet) {
        element.styleSheet.cssText = src;
      } else {
        element.textContent = src;
      }
    }

    function remove() {
      cssy.offChange(update);
      element.remove();
      imported.forEach(function(sub) {
        sub.remove();
      })
      return cssy;
    }

    // Initialize:
    update(cssy.getSource())
    cssy.onChange(update)

    return {
      element: element,
      remove:  remove
    }
  }

  cssy.getSource = function() {
    return cssy.src;
  }

  cssy.update = function(src) {
    cssy.src = src;
    changeListeners.forEach(function(listener) {
      listener(src);
    })
    return cssy;
  }

  cssy.onChange = function(listener) {
    changeListeners.push(listener);
    return cssy;
  }

  cssy.offChange = function(listener) {
    changeListeners = changeListeners.filter(function(l) { return l !== listener })
    return cssy;
  }

  cssy.src = src;

  return cssy;
}
