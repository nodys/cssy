Changelog
=========

v2.2.0 - Judicious Rat (2016-08-05) 
----------------------------------------------------------------------

  - fix: Simplify path resolution.


v2.1.0 - Colorful Chimpanzee (2015-11-03) 
----------------------------------------------------------------------

  - feat: Add cssnano minifier configurable options (and disable unsafe optimisation)


v2.0.3 - Messy Panda (2015-10-23) 
----------------------------------------------------------------------

  - fix: Disable z-index optimization


v2.0.2 - Quick Fish (2015-10-07) 
----------------------------------------------------------------------

  - test: No longer run test with old node.js versions


v2.0.1 - Calamitous Dog (2015-10-07) 
----------------------------------------------------------------------

  - fix: Add the missing dependency...


v2.0.0 - Malicious Puppy (2015-10-07) 
----------------------------------------------------------------------

  - doc: Add a note on the use of cssnano for minification / optimization
  - fix: Add sourceURL to sourcemap to prevent braking change.
  - refactor: Use cssnano instead of csswring


v1.3.0 - Nocturnal Crocodile (2015-10-05) 
----------------------------------------------------------------------



v1.2.0 - Benevolent Seal (2015-07-15) 
----------------------------------------------------------------------

  - feat: Supply autoprefixer processor
  - fix: License field
  - fix: Add more explicit error message when parser can't find dependency


v1.1.2 - Lovable Eagle (2015-05-29) 
----------------------------------------------------------------------

  - test: Use iojs for test because of jsdom requirements


v1.1.1 - Intransigent Camel (2015-05-29) 
----------------------------------------------------------------------

  - doc: Update test coverage


v1.1.0 - Effulgent Panda (2015-05-29) 
----------------------------------------------------------------------

  - doc: Update api doc
  - doc: Update badges
  - doc: Update exemple (upgrade outdated dependencies)
  - fix: node-sass api breaking changes


v1.0.2 - Smart Giraffe (2015-05-17) 
----------------------------------------------------------------------

  - doc: Update link to exemple


v1.0.1 - Shy Zebra (2015-01-22) 
----------------------------------------------------------------------

  - fix: Relative path to css source files


v1.0.0 - Limpid Dolphin (2015-01-22) 
----------------------------------------------------------------------

  - doc: Add exemple for cssy + htmly + lrio
  - fix: Less breaking changes
  - fix: Handle node-sass breaking changes
  - test: Fix invalid target element


v0.4.0 - Energetic Sheep (2014-10-24) 
----------------------------------------------------------------------

  - fix: Attach server only once
  - fix: Use last version of chokidar and update code according to new chokidar requirement


v0.3.3 - Shy Squirrel (2014-10-23) 
----------------------------------------------------------------------

  - fix: Do not insert twice the same source in the same parent with the same media query


v0.3.2 - Candid Squirrel (2014-10-13) 
----------------------------------------------------------------------

  - doc: Change repository
  - doc: Add notice about SyntaxError: Unexpected token ILLEGAL
  - refactor: Change repository


v0.3.1 - Quick Scorpion (2014-10-08) 
----------------------------------------------------------------------

  - fix: Missing dependency syntax-error (not a devDependency)
  - fix: Typo in remedy regex
  - doc: Fix path to source
  - doc: Typo


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


