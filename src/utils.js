var async = require('async')


/**
 * Return a composition of sync and async function exectuable in sequence
 *
 * See [async.seq()](https://github.com/caolan/async#seqfn1-fn2).
 * Each function from `stack` consumes the return value of the latter function.
 * Function can return a value (sync) or use the callback (async)
 *
 * @param {Array} fns
 *        List of function in order
 *
 * @return {Function}
 *         Composed function, that take the initial value
 */
exports.compose = function(fns) {
  if(!Array.isArray(fns)) {
    throw new Error('Invalid argument: Array required')
  }
  fns = fns.map(function(fn) { return exports.toAsync(fn) });
  return async.seq.apply(null, fns)
}


/**
 * Make any function asynchronous (node's async standard)
 *
 * Example:
 *
 * ```
 * var foo = toAsync(function(arg) {
 *   return 35 + arg;
 * })
 *
 * // Is equivalent to:
 *
 * var bar = toAsync(function(arg, done) {
 *   done(null, 35 + arg)
 * })
 *
 * // Both `foo()` and `bar()` are async functions:
 * foo(7, function(err, result) { })
 * bar(7, function(err, result) { })
 * ```
 *
 * @param {Function} fn
 *        If the function return a value (!undefined), then
 *        the value is passed to the async callback. Else, this wrapper
 *        is transparent.
 *
 * @return {Function}
 *         Asynchronous function
 */
exports.toAsync = function (fn) {
  if(typeof(fn) != 'function') {
    throw new Error('Invalid argument: Function required')
  }
  return function() {
    var args   = Array.prototype.slice.apply(arguments);
    var done   = args.pop();
    var result;

    function doneOnce() {
      if(!doneOnce.isDone) done.apply(null, arguments)
      doneOnce.isDone = true;
    }

    args.push(doneOnce)

    try {
      result = fn.apply(null, args)
    } catch(e) {
      isDone = true;
      doneOnce(e);
    }
    if(typeof(result) != 'undefined') doneOnce(null, result)
  }
}
