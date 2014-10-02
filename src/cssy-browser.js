
/*
 * Create a cssy browser instance for one css source
 *
 * @param  {String} src
 *         Css source
 *
 * @param  {Array} imports
 *         List of imported cssy browser instances
 *
 * @return {Object}
 *         Cssy browser instance
 */
module.exports = function(src, imports) {

  var changeListeners = [];

  /**
   * CssyBrowser is the object exported by a module handled by cssy:
   *
   * ```javascript
   * var myCss = require('./my.css');
   * // myCss is a CssyBrowser
   * ```
   *
   * A CssyBrowser instance can be used as:
   *
   * - **An string** when used in a context that imply a string: thanks to
   *   `CssyBrowser.toString()` that return the css source.
   * - **A function**, alias of CssyBrowser.insert([to, [media]]), to inject
   *   the css source in the document: `myCss()`,
   *   `myCss(element)` or `myCss(element, 'media query')`.
   * - **An object** with the methods described below.
   *
   * @return {Object}
   *         See [CssyBrowser.insert()](#CssyBrowser.insert)
   */
  function CssyBrowser() {
    return CssyBrowser.insert.apply(null, arguments)
  }

  /**
   * Insert a `<style>` element in the DOM with current css source
   *
   * The content of all the injected style is binded css source changes
   * (see `CssyBrowser.update()` and `CssyBrowser.onChange()`)
   *
   * @param  {[HTMLElement|ShadowRoot]} to
   *         Where to inject the style. Default to document's head.
   *
   * @param  {[String]} media
   *         Set the media attribute of the injected style tag
   *
   * @return {Object}
   *         An object with:
   *         - `element` **{HTMLElement}**: The `style` element inserted
   *         - `imported` **{Array}**: The other CssyBrowser instances imported
   *           and injected by this instance
   *         - `remove` **{Function}**: Remove injected `style` element and all
   *           other CssyBrowser instances imported
   */
  CssyBrowser.insert = function(to, media) {

    var imported = imports.map(function(imp) {
      // TODO: What if imp.cssy is not a cssy browser instance
      // TODO: 'media and ('+imp.media+')' ?
      var sub = imp.cssy(to, imp.media);
      return sub;
    })

    var element = document.createElement('style');
    element.setAttribute('type', 'text/css');
    if(media) {
      element.setAttribute('media', media)
    }
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
      CssyBrowser.offChange(update);
      try {
        element.parentNode.removeChild(element);
      } catch(e) {}
      imported.forEach(function(sub) {
        sub.remove();
      })
      return CssyBrowser;
    }

    // Initialize:
    update(CssyBrowser.toString())
    CssyBrowser.onChange(update)

    return {
      element:  element,
      imported: imported,
      remove:   remove
    }
  }

  /**
   * Override default toString()
   *
   * @return {String} Current css source
   */
  CssyBrowser.toString = function() {
    return CssyBrowser.src;
  }

  /**
   * Update current css source
   *
   * Each inject style element are updated too
   *
   * @param  {String} src
   */
  CssyBrowser.update = function(src) {
    CssyBrowser.src = src;
    changeListeners.forEach(function(listener) {
      listener(src);
    })
    return CssyBrowser;
  }

  /**
   * Listen for css source changes
   *
   * @param {Function} listener
   *        Change listener. Receive new css source
   */
  CssyBrowser.onChange = function(listener) {
    changeListeners.push(listener);
    return CssyBrowser;
  }

  /**
   * Detach change listener
   *
   * @param {Function} listener
   */
  CssyBrowser.offChange = function(listener) {
    changeListeners = changeListeners.filter(function(l) { return l !== listener })
    return CssyBrowser;
  }

  /**
   * Get the imported CssyBrowser instance (based on `@import` at-rules)
   *
   * @return {Array}
   *         Array of CssyBrowser instance
   */
  CssyBrowser.getImports = function() {
    return imports;
  }

  CssyBrowser.src = src;

  return CssyBrowser;
}
