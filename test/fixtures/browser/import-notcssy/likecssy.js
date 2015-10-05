var src = 'body { padding : 1em }'

exports.insert = function (to, media) {
  var element = document.createElement('style')

  element.setAttribute('type', 'text/css')

  if (media) {
    element.setAttribute('media', media)
  }

  to = to || document.getElementsByTagName('head')[0]
  to.appendChild(element)

  if (element.styleSheet) {
    element.styleSheet.cssText = src
  } else {
    element.textContent = src
  }

  return {
    remove: function remove () {
      element.parentNode.removeChild(element)
    }
  }
}
