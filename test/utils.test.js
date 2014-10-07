/* jshint undef: false, unused: false */

var expect = require('expect.js')
var utils  = (process.env.COVERAGE ? require('../lib-cov/utils.js') : require('../lib/utils.js'))
var fixp   = require('./support').fixp
var resolve = require('path').resolve

describe('cssy utils', function(){

  describe('.toAsync()', function() {
    it('should transform a sync function to an async one', function(done) {
      var foo = utils.toAsync(function(arg) {
        return 35 + arg;
      })
      foo(7, function(err, result) {
        expect(result).to.eql(42)
        done();
      })
    })

    it('should not call callback twice', function() {
      var calls = 0;
      var foo = utils.toAsync(function(callback) {
        callback(null, 42)
        return 42; // ! undefined
      })
      foo(function(err, result) { calls++ })
      expect(calls).to.eql(1);
    })

    it('should catch errors', function(done) {
      var foo = utils.toAsync(function() {
        throw new Error('Ouch')
      })
      foo(function(err) {
        expect(err).to.be.an(Error)
        done();
      })
    })

    it('should throw an error on invalid argument', function() {
      expect(function() {
        utils.toAsync('invalid')
      }).to.throwError('Invalid argument')
    })
  })

  describe('.compose()', function() {
    it('should create a composed function from sync and async functions', function(done) {
      var compo = utils.compose([
        function(arg)       { return     arg + 'B'  },
        function(arg, done) { done(null, arg + 'C') },
        function(arg)       { return     arg + 'D'  },
      ])

      expect(compo).to.be.a(Function);

      compo('A', function(err, result) {
        expect(result).to.eql('ABCD')
        done()
      })
    })

    it('should catch sync error', function(done) {
      var compo = utils.compose([
        function(arg)       { throw(new Error('Oups')) },
      ])
      compo('A', function(err) {
        expect(err).to.be.an(Error)
        done()
      })
    })

    it('should catch async error', function(done) {
      var compo = utils.compose([
        function(arg, done) { done(new Error('Oups')) },
      ])
      compo('A', function(err) {
        expect(err).to.be.an(Error)
        done()
      })
    })

    it('should work with an empty list of function (pass arguments through)', function(done) {
      var compo = utils.compose([])
      compo('A', function(err, result) {
        expect(result).to.eql('A')
        done()
      })
    })

    it('should throw an error on invalid argument', function() {
      expect(function() {
        utils.compose('invalid')
      }).to.throwError('Invalid argument')
    })
  })

  describe('.getCssyConfig()', function() {
    var pkgpath = fixp('getconfig/package.json');

    it('should get the cssy config for given package.json path', function() {
      expect(utils.getCssyConfig(pkgpath))
        .to.eql({ "processor": "./cssProcessor.js" })
    })

    it('should get the cssy config for given package.json object', function() {
      expect(utils.getCssyConfig(require(pkgpath)))
        .to.eql({ "processor": "./cssProcessor.js" })
    })

    it('should return an empty config object if package can not be read', function() {
      expect(utils.getCssyConfig('invalid')).to.eql({})

    })
  })

  describe('.getCwdPackagePath()', function() {
    it('should get cwd package.json path', function() {
      expect(utils.getCwdPackagePath())
        .to.eql(resolve(__dirname, '../package.json'))
    })
  })



})
