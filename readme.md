# cssy
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]

[travis-image]: https://img.shields.io/travis/nodys/cssy.svg?style=flat&branch=master
[travis-url]: https://travis-ci.org/nodys/cssy
[npm-image]: https://img.shields.io/npm/v/cssy.svg?style=flat
[npm-url]: https://npmjs.org/package/cssy
[downloads-image]: https://img.shields.io/npm/dm/cssy.svg?style=flat
[downloads-url]: https://npmjs.org/package/cssy


> A browserify transform for css (with vitamins): Use css sources **like any other module** but **without forgo** the benefits of **pre-processing** and **live source reload**.

```javascript
var myCss = require('foo/my.css')
myCss()                           // Inject the css in document
myCss(elsewhere)                  // To inject css elsewhere
myCss(elsewhere, 'tv')            // Media query...
myCss.update('h1 { }')            // Update source for all injected instances
myCss.onChange(function(css) { }) // Watch for change (hey, you like live source reload ?)
console.log('Source: %s', myCss)  // Use as a string
```

See [exemple with cssy, htmly and lrio](https://github.com/nodys/cssy/tree/master/exemples)

## Features

- **Require css as any other commonjs module**: `require('foo/common.css')`.
- **Pre/post processing**: Cssy is framework-agnostic:
  - Use any  [post/pre-processor](https://developer.chrome.com/devtools/docs/css-preprocessors) you like ([rework](https://github.com/reworkcss/rework), [postcss](https://github.com/postcss/postcss),  [less](http://lesscss.org/), [sass](http://sass-lang.com/), etc.)
  - At package level, you encapsulate your *css secret cooking* and export only standard css.
  - At application level you can do **global processing** for things like global `url()` rebasing.
- **A nice API to read, insert, update or remove**: Use the exported css wherever you want and as you like.
- **@import**: If enabled, the css at-rule [@import](https://developer.mozilla.org/en-US/docs/Web/CSS/@import) `require()` and inject another css module for you.
- **Source map**: If enabled, cssy inject a [source map](https://developer.chrome.com/devtools/docs/css-preprocessors).
- **Live source reload**: Provide a simple http(s) server hook reload seamlessly css source in development environnement.
- **Regex filter**: Configurable, you can apply cssy's transform selectively
- **Plugin**: Use [cssy as a plugin](#cssy-plugin) at application level to configure cssy finely
- **Remedy**: Enable [cssy remedy](#remedy) to handle package that does not export css as commonjs module

Want a nice cocktail recipe ? Use **source map** in combination with cssy's **live source reload feature** and chrome's [in-browser edition](https://developer.chrome.com/devtools/docs/workspaces).


## Installation


```bash
npm install --save cssy
```

**Then add cssy transform to your `package.json`**. Encapsulate your css processing logic inside your package: use [browserify.transform field](https://github.com/substack/browserify-handbook#browserifytransform-field).

```javascript
{
  // ...
  "browserify": { "transform": [ "cssy" ] ] }
}
```

## Options

In you `package.json` you can add some options for the current package (`[ "cssy", {  /* options */ } ]`)

- `parser` **{Array|String}**: One or many path to module that export a [parser](#parser)
- `processor` **{Array|String}**: One or many path to module that export a [Css processor](#processor)
- `import` **{Boolean}**: Allow [@import](#import-css) behavior (default: true)
- `match` **{String|Array}**: Filter which file cssy must handle. See [Regex filter](#regex-filter)

Path inside `parser` and `processor` options are either relative to package.json or npm package.


**Example:**

```javascript

  // ...
  "browserify": { "transform": [
    [ "cssy",
      {  
        "parser"   : [
          "./mySassParser",
          "./myLessParser"
        ],
        "processor": "./support/myCssProcessor",
        "import"   : false,
        "match"    : ["\\.(css|mycss)$",i]
      }
    ]
  ]}

```


*Notice: Starting from v2, cssy will probably works for with node.js v0.12 (and even v0.10) until the next major version, but is only tested against node.js >= v4*

## Global configuration

At *application level* you can change some *global* cssy behaviors

```javascript
var cssy = require('cssy')
cssy.config({
  // Enable css minification (default: false)
  minify:  false, // boolean or object: a cssnano options (default is {safe: true})
  // Enable source map in the generated source (default: true)
  sourcemap: true
})
```

*Css minification is done with [cssnano](http://cssnano.co/) which do a lot of other optimizations. Feel free to use another one inside a [global post-processor](#global-prepost-processor).*

## Internal workflow

1. **Parser** Cssy try each [parser](#parser) to transform any kind of source to css (from stylus, less, sass, etc.) with a source map.
2. **Global pre-processor**: Cssy call each [Global pre-processor](#global-prepost-processor)
3. **processor**: Cssy call each [local processor](#processor)
4. **Global post-processor**: Cssy call each [Global post-processor](#global-prepost-processor)
4. **@import**: If enable cssy extract `@import` at-rules (see [Import css](#import-css))
4. **minify**: If enable cssy minify css source
4. **source map**: If enable cssy add the source-map
4. **live reload**: If enable cssy add live source reload client to the generated bundle

## Context object

Each function that transform a css source ([parser](#parser), [global pre/post processor](#global-prepost-processor), [processor](#processor)), receive a **context object**:

  - `src` **{String}**: Css source
  - `filename` **{String}**: Css source filepath (relative to `process.cwd()`)
  - `config` **{Object}**: The cssy's [transform configuration](https://github.com/substack/browserify-handbook#configuring-transforms)
  - `map` **{Object}**: The [css source map](https://www.google.com/search?q=Source+Map+Revision+3+proposal) (undefined for the [parsers](#parser): as they must provide it)

## Functions

Each function used in cssy ([parser](#parser), [global pre/post processor](#global-prepost-processor), [processor](#processor)) use the same API and **may be asynchronous or synchronous**.

```javascript

// Asynchronous parser, processor, pre/post processor:
module.exports = function (ctx, done) {
  // ... change the ctx object ...

  // Return ctx
  done(null, ctx)

  // Or if something wrong happened
  done(new Error('oups...'))
}

// Synchronous parser, processor, pre/post processor:
module.exports = function (ctx) {
  // ... change the ctx object ...
  return ctx;
}
```

## Css meta-language: sass, stylus, less, ...

Cssy provide [parsers for common css meta-languages](./src/parsers). But, cssy does not depend on them so you can install only what you use, and control version according to you needs. For instance, to use less sources with cssy, add [less](https://www.npmjs.org/package/less) to your package dependencies (`npm install --save less`).

If you need something more specific, you may add your own parser.

## Parser

Parser's job is to read a source from any format (sass, stylus, less, *whatever*), and to return a **css source** and a **source-map**.

- Parsers use the [same api](#functions) than any other function used in cssy
- See [options.parser](#options) to add your own parser before cssy's parsers
- See [cssy's parsers for common css meta-languages](./src/parsers) as example.
- Parser are executed in series, until one return a context with a source-map.

## Processor

For cssy, a *processor* is an function that transform a [cssy context object](#cssy-context-object) to another [cssy context object](#cssy-context-object). Like for [browserify's transform](https://github.com/substack/node-browserify#btransformopts-tr) cssy processor are applied **only on the sources of the current package**. (See too [Global pre/post processor](#Global pre/post processor))


- Parsers use the [same api](#functions) than any other function used in cssy
- See [options.processor](#options) to add one or many processor

### Processor example
Here with [postcss](https://github.com/postcss/postcss) but you can use any other library (Preferably with good source-map support)

```javascript
var autoprefixer     = require('autoprefixer');
var postcssCalc      = require('postcss-calc');
var customProperties = require("postcss-custom-properties")
var postcss          = require('postcss');

module.exports = function(ctx, done) {
  var result = postcss()
    .use(customProperties())
    .use(postcssCalc())
    .use(autoprefixer.postcss)
    .process(ctx.src, {
      map : { prev : ctx.map } // Preserve source map !
    });

  ctx.src = result.css;
  ctx.map = result.map.toJSON();

  done(null, ctx)
}
```

**Note:** As [autoprefixer](https://www.npmjs.com/package/autoprefixer) is very useful, so cssy bundle a processor for it (`cssy/autoprefixer`).

You still have to declare it using browserify transform options:

Api:
```javascript
b.transform('cssy', {'processor': ['cssy/autoprefixer']})
```

Or in your package.json:
```javascript
{
// ...
  "browserify": {
    "transform": [
      ["cssy", { "processor": ["cssy/autoprefixer"] }]
    ]
  }
// ...
}
```



## Global pre/post processor

Global pre/post processor must be used only at *application level* (where you bundle your application) for things like global `url()` rebasing, optimizations for production, etc. Pre/post processor share the same api than [cssy processor](#processor).

```javascript
var cssy = require('cssy')

// Add one or many pre-processors
cssy.pre(function(ctx, done) {
  // ... Applied on every source handled by cssy
})

// Add one or many post-processors
cssy.post(function(ctx, done) {
  // ... Applied on every source handled by cssy
})

```
See too [use cssy plugin to add pre/post processor](#cssy-plugin)

## Live source reload

**Cssy provide a tiny live source reload mechanism based on websocket for development purpose only.**

Classic live source reload for css usually require that all (builded) css source are accessible via an url. This is not convenient with bundled css sources that comes from anywhere in the dependency tree. And this is almost impraticable if css sources are injected somewhere else than the main document (shadow root for instance) without reloading all the page.

**Just attach cssy to the http(s) server that serve the application, cssy will do the rest:** (browserify bundler must in the same process):

```javascript
var http   = require('http')
var cssy   = require('cssy')
var server = http.createServer(/* your application */).listen(8080);

cssy.live(server);
```

### Use your own file watcher

To trigger a change on a css source, just call the change listener returned by `cssy.attachServer()` :

```javascript
var cssyChangeListener = cssy.attachServer(server);
cssyChangeListener('path/to/source.css');
```

Here is an example with [chockidar](https://github.com/paulmillr/chokidar) :

```javascript
require('chokidar')
  .watch('.', {ignored: /[\/\\]\./})
  .on('change', cssy.attachServer(server))
```

## Import css

Unless you set the [import option](#options) to false, `@import` [at-rules](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule) works like a `require()`.

For instance with two css file, `app.css` and `print.css`:

```css
/* app.css */
@import "print.css" print;
body { /* ... */ }
```

```css
/* print.css */
.not-printable { display: none }
```

When you inject `app.css`, `print.css` will be injected too with the media query `print`

## Regex filter

Default filter is all css files and most meta-css-language files: `/\.(css|sass|scss|less|styl)$/i`. You can set the [match option](#options) to filter which file cssy must handle.

`match` option is either a String or an Array used to instantiate a new [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions):

- With a string `"\\.myCss$"` become `/\.myCss$/`
- With an array, to add regular expression flags `["\\.myCss$","i"]` become `/\.myCss$/i`


```javascript
{
  // ... package.json ...
  "browserify": {
    "transform": [
      // Match all *.mycss files in src/css
      [ "cssy", {  match: ["src\\/css\\/.*\\.mycss$","i"] } ]
    ]
  }
}
```

## Cssy plugin

Cssy can be used as a browserify plugin to set global behaviors:

#### Using browserify api

```javascript
var browserify = require('browserify');
var cssy       = require('cssy');
var b = browserify('./app.css')
b.plugin(cssy, {
  // Global configuration:
  minify:    true,  // boolean or object: a cssnano options (default is {safe: true})
  sourcemap: false,

  // See live source reload:
  live: myHttpServerInstance,

  // See pre/post processor (function or path to a processor module):
  pre:  [
    './myPreprocessor',
    function anotherPreprocessor(ctx) { return ctx }
  ],
  post: 'post-processor',

  // See remedy:
  //   - Use current package cssy config:
  remedy: true,
  //   - Use set remedy config:
  remedy: {
    processor: './processor' // (function or path to a processor module)
    match:     /css$/i,
    import:    false
  }
})

```

#### Using browserify command

Browserify use [subarg](https://www.npmjs.org/package/subarg) syntaxe. See too [browserify plugin](https://github.com/substack/node-browserify#plugins)

```sh
browserify ./app.css -p [                                 \
  cssy                                                    \
    --minify                                              \
    --no-sourcemap                 # sourcemap = false    \
    --live './server.js'                                  \
    --pre  './myPreprocessor'                             \
    --pre  'another-preprocessor'  # repeat for an array  \
    --post 'post-processor'                               \
    --remedy                       # enable remedy ...    \
    --remedy [                     # ... or use subarg    \
      --processor './processor'                           \
      --no-import                                         \
      --match 'css$' --match 'i'                          \
    ]                                                     \
]
```

## Remedy

**Cssy's remedy is a solution to use libraries that does not export their css sources as commonjs modules**

Browserify transforms are scoped to the current package, not its dependency: and that's a good thing !

> *[From module-deps readme:](https://github.com/substack/module-deps#transforms)* (...) the transformations you specify will not be run for any files in node_modules/. This is because modules you include should be self-contained and not need to worry about guarding themselves against transformations that may happen upstream.

**However**, if you want to use some parts of a library like [semantic-ui](https://github.com/Semantic-Org/Semantic-UI), cssy provide a solution **at application level** (where you bundle your application): the **remedy** global transform.

#### Enable remedy:

If remedy options is `true` cssy will use the cssy configuration from the `package.json` closest to the current working directory :

```javascript
// Add remedy to a browserify instance (bundler)
bundler.plugin(cssy, { remedy: true })
```

But you can set specific options has described in the [cssy plugin section](#cssy-plugin)

```javascript
// Add remedy to a browserify instance (bundler)
bundler.plugin(cssy, { remedy: { processor: 'myprocessor' } })
```

#### Remedy options:

Remedy options are the same of [the cssy's transform options](#options).

#### Symptoms indicating a need for a remedy

Usually, when browserify encounter a source he can't handle correctly (such css) you see something like `SyntaxError: Unexpected token ILLEGAL`

---

# CssyBrowser API

<!-- START CssyBrowser -->

## CssyBrowser()
> CssyBrowser is the object exported by a module handled by cssy:

```javascript
var myCss = require('./my.css');
// myCss is a CssyBrowser
```

A CssyBrowser instance can be used as:

- **An string** when used in a context that imply a string: thanks to
  `CssyBrowser.toString()` that return the css source.
- **A function**, alias of CssyBrowser.insert([to, [media]]), to inject
  the css source in the document: `myCss()`,
  `myCss(element)` or `myCss(element, 'media query')`.
- **An object** with the methods described below.

**return** {`Object`}
See [CssyBrowser.insert()](#cssybrowserinsertto-media)


## CssyBrowser.insert([to], [media])
> Insert css source in the DOM

Create and append a `<style>` element in the dom at `to`. If the source contain
`@import` at-rules, imported CssyBrowser modules are injected too.

The content of all the injected `<style>` element is binded to css source
change: When `.update()` is called by you or by the cssy's live source
reload server.

If a style element with the same parent (`to`) and the same media query
already exists, then this function only increment a counter for this kind
of pair (parent/media-query). And remove() calls only decrement this
counter until no more consumer require this style to be inserted.

**Parameters:**

  - **[to]** {`HTMLElement`|`ShadowRoot`}
    Where to inject the style. Default to document's head.

  - **[media]** {`String`}
    Set the media attribute of the injected style tag

**return** {`Object`}
An object with:
- `element` **{HTMLElement}**: The `style` element inserted
- `children` **{Array}**: The other CssyBrowser instances imported
  and injected by this instance
- `remove` **{Function}**: Remove injected `style` element and all
  other CssyBrowser instances imported
  other CssyBrowser instances imported


## CssyBrowser.update(src)
> Update current css source

Each inject style element are updated too

**Parameters:**

  - **src** {`String`}



## CssyBrowser.onChange(listener)
> Listen for css source changes

**Parameters:**

  - **listener** {`Function`}
    Change listener. Receive new css source
    Change listener. Receive new css source


## CssyBrowser.offChange(listener)
> Detach change listener

**Parameters:**

  - **listener** {`Function`}



## CssyBrowser.getImports()
> Get the imported CssyBrowser instance (based on `@import` at-rules)

**return** {`Array`}
Array of CssyBrowser instance


## CssyBrowser.toString()
> Override default toString()

**return** {`String`}
The current css source

<!-- END CssyBrowser -->

---

License: [MIT](./LICENSE)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
