/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks run in CLS context.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
	/**
	 * Run set of tests on a static method to ensure callback is always run in correct CLS context.
	 * Function `fn` should call the static method being tested and return resulting promise.
	 * `fn` is called with a `promise` and a `handler` function which should be attached as the callback to the method under test.
	 * e.g. `Promise.try(handler)`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {Function} [options.handler] - Handler function
	 * @param {Function} [options.preFn] - Handler function
	 * @returns {undefined}
	 */
	testSetCallbackContextStatic: function(fn, options) {
		var u = this;
		options = options || {};

		describe('callback runs in context', function() {
			u.testRunContext(function(handler, preResult, cb) {
				var p = fn(handler, preResult);
				cb(p);
			}, options.preFn, options.handler);
		});
	},

	/**
	 * Run set of tests on a prototype method to ensure callback is always run in correct CLS context.
	 * Function `fn` should take provided `promise` and call the method being tested on it and return resulting promise.
	 * `fn` is called with a `promise` and a `handler` function which should be attached as the callback to the method under test.
	 * e.g. `return promise.then(handler)`
	 *
	 * If handler is being attached to catch rejections, `options.catches` should be `true`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} options.continues - true if handler fires on resolved promise
	 * @param {boolean} options.catches - true if handler fires on rejected promise
	 * @param {boolean} options.passThrough - true if method passes through errors even if handler fires
	 * @param {boolean} options.skipUncalled - true if should skip cases where handler not called
	 * @returns {undefined}
	 */
	testSetCallbackContextProto: function(fn, options) {
		var u = this;
		describe('callback runs in context on promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				var handlerShouldBeCalled = u.getRejectStatus(makePromise) ? options.catches : options.continues;
				if (options.skipUncalled && !handlerShouldBeCalled) return;
				var expectedCalls = handlerShouldBeCalled ? 1 : 0;

				u.testRunContext(function(handler, p, cb) {
					attach(function() {
						var newP = fn(p, handler);
						if (options.passThrough || !handlerShouldBeCalled) u.inheritRejectStatus(newP, p);
						cb(newP);
					}, p);
				}, makePromise, undefined, {expectedCalls: expectedCalls});
			});
		});
	},

	/**
	 * Run set of tests on a static method that takes an array or promise of an array and a handler
	 * to ensure callback is always run in correct CLS context.
	 *
	 * Test function `fn` is called with a `value` and a `handler`.
	 * `fn` should call the method being tested with `value`, attaching `handler` and return resulting promise.
	 * e.g. `return Promise.map(value, handler)`
	 *
	 * If handler is being attached to catch rejections, `options.catches` should be `true`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} options.continues - true if handler fires on resolved promise
	 * @param {boolean} options.catches - true if handler fires on rejected promise
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.literal=false] - true if method receives only array not promise of array (`Promise.join()`)
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`.spread()`)
	 * @returns {undefined}
	 */
	testSetCallbackContextStaticArray: function(fn, options) {
		var u = this;
		describe('callback runs in context on promise', function() {
			u[options.literal ? 'describeArrays' : 'describeArrayOrPromiseOfArrays'](function(makeValue) {
				// If handler should not be fired on this promise, check is not fired
				var handlerShouldBeCalled = u.getRejectStatus(makeValue) ? options.catches : options.continues;
				var expectedCalls = handlerShouldBeCalled ? (options.oneCallback ? 1 : 3) : 0;

				u.testRunContext(function(handler, value, cb) {
					// Workaround for bug in bluebird v2
					u.helperSuppressUnhandledRejectionsStaticArray(value, makeValue);

					var p = fn(value, handler);
					if (!handlerShouldBeCalled) u.inheritRejectStatus(p, value);
	                cb(p);
	            }, makeValue, undefined, {expectedCalls: expectedCalls});
			}, {noUndefined: options.noUndefinedValue});
		});
	},

	/**
	 * Run set of tests on a prototype method that chains onto a promise of an array
	 * to ensure callback is always run in correct CLS context.
	 * Function `fn` should take provided `promise` and call the method being tested on it with `handler`
	 * and return resulting promise.
	 * e.g. `return promise.map(handler)`
	 *
	 * If handler is being attached to catch rejections, `options.catches` should be `true`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} options.continues - true if handler fires on resolved promise
	 * @param {boolean} options.catches - true if handler fires on rejected promise
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`.spread()`)
	 * @returns {undefined}
	 */
	testSetCallbackContextProtoArray: function(fn, options) {
		var u = this;
		describe('callback runs in context on promise', function() {
			u.describeMainPromisesArrayAttach(function(makePromise, attach) {
				var handlerShouldBeCalled = u.getRejectStatus(makePromise) ? options.catches : options.continues;
				var expectedCalls = handlerShouldBeCalled ? (options.oneCallback ? 1 : 3) : 0;

				u.testRunContext(function(handler, p, cb) {
					attach(function() {
						var newP = fn(p, handler);
						if (!handlerShouldBeCalled) u.inheritRejectStatus(newP, p);
						cb(newP);
					}, p);
				}, makePromise, undefined, {expectedCalls: expectedCalls});
			}, {noUndefined: options.noUndefinedValue});
		});
	}
};
