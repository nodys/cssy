Changelog
=========

v0.3.0 - Heavy Giraffe (2014-10-07) 
----------------------------------------------------------------------

  - doc: Update travis badge url
  - doc: Add meta-css language notice
  - refactor: Change github repository
  - refactor: Rename src folder to lib
  - refactor: Stabilize remedy behavior
  - refactor: new plugin name "remedy" (for dependency without cssy)
  - test: No cssy stuff and remedy plugin
  - test: Add more test for plugin usage
  - feat: @import now support any kind of module that can return a css source
  - feat: Now support css module from package that does not export css as module.


v0.2.0 - Didactic Alligator (2014-10-03) 
----------------------------------------------------------------------

  - doc: Clean up documentation and add workflow + parser doc
  - feature: Add default parser for stylus, sass and less
  - test: Add test for sass, stylus and less
  - test: Fix cssy module path
  - test: Add some test fixture
  - test: Refactor test modules
  - refactor: Refactor asynchronous composition and add parsers
  - fix: Support empty source


v0.1.1 - Discreet Octopus (2014-10-02) 
----------------------------------------------------------------------

  - fix: Add missing package: postcss


v0.1.0 - Coldblooded Elephant (2014-10-02) 
----------------------------------------------------------------------

  - doc: Add CssyBrowser API documentation
  - doc: Update documentation (use docflux for doc generation)
  - doc: Add import and match option doc
  - doc: Readme update with new sections
  - doc: Documentation in progress
  - doc: Add code documentation
  - refactor: Cleanup and document cssy-browser api and add CssyBrowser.getImports()
  - refactor: Option minify in place of ‘compress’ (and simplify cssy.config() api)
  - refactor: Livereload configuration is a flag activated by attachServer()
  - refactor: Change browser api : getSource() to toString()
  - refactor: Put live reload outside and simplify API
  - refactor: Cleanup
  - refactor: API more framework agnostic
  - refactor: Simplify API
  - refactor: Clean up and rename
  - refactor: Split into modules
  - feat: Add cssy.live() for automatic live reload
  - feat: Set media query with insert()
  - feat: Add global pre/post processing
  - feat: Use rework plugin AND transforms
  - feat: Add css transforms options
  - fix: Use lrio.emit() in place of trigger()
  - fix: Update use of lrio acceding to API stabilisation
  - fix: Use csswring for compression
  - fix: Do not import css from package without cssy
  - fix: processor must check for source file existence
  - test: Full coverage tests
  - test: More test, more coverage
  - test: Add browser tests
  - test: More browser api tests
  - test: Add new api tests (and a browser test)
  - test: Add filter and transform tests
  - test: Add some processor tests


