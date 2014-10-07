

module.exports = createCssyBrowser;

/*
 * Create a cssy browser instance for one css source
 *
 * @param  {String} src
 *         Css source
 *
 * @param  {Array} [imports]
 *         List of imported cssy browser instances
 *
 * @return {Object}
 *         Cssy browser instance
 */
function createCssyBrowser(src, imports) {

  imports = imports || [];

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
   *         See [CssyBrowser.insert()](#cssybrowserinsertto-media)
   */
  function CssyBrowser() {
    return CssyBrowser.insert.apply(null, arguments)
  }

  /**
   * Insert css source in the DOM
   *
   * Create and append a `<style>` element in the dom at `to`. If the source contain
   * `@import` at-rules, imported CssyBrowser modules are injected too.
   * The content of all the injected `<style>` element is binded to css source
   * change: When `.update()` is called by you or by the cssy's live source
   * reload server.
   *
   * @param  {HTMLElement|ShadowRoot} [to]
   *         Where to inject the style. Default to document's head.
   *
   * @param  {String} [media]
   *         Set the media attribute of the injected style tag
   *
   * @return {Object}
   *         An object with:
   *         - `element` **{HTMLElement}**: The `style` element inserted
   *         - `children` **{Array}**: The other CssyBrowser instances imported
   *           and injected by this instance
   *         - `remove` **{Function}**: Remove injected `style` element and all
   *           other CssyBrowser instances imported
   */
  CssyBrowser.insert = function(to, media) {

    var children = imports.map(function(imp) {
      var submodule = imp.module;

      var submedia  = [];
      if(media)     { submedia.push(media) }
      if(imp.media) { submedia.push(imp.media) }
      submedia = submedia.join(' and ')

      if('function' == typeof(submodule.insert)) {
        child = submodule.insert( to, submedia )
      } else if('function' == typeof(submodule.toString)) {
        // A string or any thing that provide a string
        // we crate and inject a new CssyBrowser instance.
        // As this module is not bundler with cssy's transform
        // we can not provide live source update.
        child = createCssyBrowser(submodule.toString()).insert( to, submedia )
      }

      return child;
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
      children.forEach(function(child) {
        child.remove();
      })
      return CssyBrowser;
    }

    // Initialize:
    update(CssyBrowser.toString())
    CssyBrowser.onChange(update)

    return {
      element:  element,
      children: children,
      remove:   remove
    }
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


  /**
   * Override default toString()
   *
   * @return {String}
   *         The current css source
   */
  CssyBrowser.toString = function() {
    return CssyBrowser.src;
  }

  CssyBrowser.src = src;

  return CssyBrowser;
}
