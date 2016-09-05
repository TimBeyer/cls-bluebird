/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that callbacks are run sync/async.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
	/**
	 * Run set of tests on a prototype method to ensure always calls callback asynchronously.
	 * Function `fn` should take provided `promise` and call the method being tested on it,
	 * attaching `handler` as the callback.
	 * e.g. `return promise.then(handler)`
	 *
	 * If handler is being attached to catch rejections, `options.catches` should be `true`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires on rejected promise
	 * @param {boolean} [options.passThrough=false] - true if method passes through errors even if handler fires
	 * @param {boolean} [options.skipUncalled=false] - true if should skip cases where handler not called
	 * @returns {undefined}
	 */
	testSetCallbackAsyncProto: function(fn, options) {
		var u = this;
		describe('calls callback asynchronously when called on promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				var handlerShouldBeCalled = u.getRejectStatus(makePromise) ? options.catches : options.continues;
				if (options.skipUncalled && !handlerShouldBeCalled) return;
				var expectedCalls = handlerShouldBeCalled ? 1 : 0;

				u.testAsync(function(handler, cb) {
					var p = makePromise();

					attach(function() {
						var newP = fn(p, handler);
						if (options.passThrough || !handlerShouldBeCalled) u.inheritRejectStatus(newP, p);
						cb(newP);
					}, p);
				}, undefined, {expectedCalls: expectedCalls});
			});
		});
	},

	/**
	 * Run set of tests on a static method that takes an array or promise of an array and a handler
	 * to ensure always calls callback asynchronously.
	 *
	 * Test function `fn` is called with a `value` and a `handler`.
	 * `fn` should call the method being tested with `value`, attaching `handler` and return resulting promise.
	 * e.g. `return Promise.map(value, handler)`
	 *
	 * If handler is being attached to catch rejections, `options.catches` should be `true`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires on rejected promise
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.literal=false] - true if method receives only array not promise of array (`Promise.join()`)
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`.spread()`)
	 * @param {boolean} [options.skip=false] - true if tests should be skipped
	 * @returns {undefined}
	 */
	testSetCallbackAsyncStaticArray: function(fn, options) {
		var u = this;

		(options.skip ? describe.skip : describe)('calls callback asynchronously when called on', function() {
			u[options.literal ? 'describeArrays' : 'describeArrayOrPromiseOfArrays'](function(makeValue) {
				// If handler should not be fired on this promise, check is not fired
				var handlerShouldBeCalled = u.getRejectStatus(makeValue) ? options.catches : options.continues;
				var expectedCalls = handlerShouldBeCalled ? (options.oneCallback ? 1 : 3) : 0;

				u.testAsync(function(handler, cb) {
					var value = makeValue();

					// Workaround for bug in bluebird v2
					u.helperSuppressUnhandledRejectionsStaticArray(value, makeValue);

					var p = fn(value, handler);
					if (!handlerShouldBeCalled) u.inheritRejectStatus(p, value);
					cb(p);
				}, undefined, {expectedCalls: expectedCalls});
			}, {noUndefined: options.noUndefinedValue});
		});
	},

	/**
	 * Run set of tests on a prototype method that chains onto a promise of an array
	 * to ensure always calls callback asynchronously.
	 * Function `fn` should take provided `promise` and call the method being tested on it,
	 * attaching `handler` as the callback.
	 * e.g. `return promise.map(handler)`
	 *
	 * If handler is being attached to catch rejections, `options.catches` should be `true`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires on rejected promise
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`.spread()`)
	 * @returns {undefined}
	 */
	testSetCallbackAsyncProtoArray: function(fn, options) {
		var u = this;
		describe('calls callback asynchronously when called on promise', function() {
			u.describeMainPromisesArrayAttach(function(makePromise, attach) {
				var handlerShouldBeCalled = u.getRejectStatus(makePromise) ? options.catches : options.continues;
				var expectedCalls = handlerShouldBeCalled ? (options.oneCallback ? 1 : 3) : 0;

				u.testAsync(function(handler, cb) {
					var p = makePromise();

					attach(function() {
						var newP = fn(p, handler);
						if (!handlerShouldBeCalled) u.inheritRejectStatus(newP, p);
						cb(newP);
					}, p);
				}, undefined, {expectedCalls: expectedCalls});
			}, {noUndefined: options.noUndefinedValue});
		});
	},

	/**
	 * Run set of tests on a static method to ensure always calls callback synchronously.
	 * Function `fn` should call the method being tested, attaching `handler` as the callback.
	 * e.g. `return Promise.try(handler)`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {Function} [options.handler] - Optional handler function
	 * @returns {undefined}
	 */
	testSetCallbackSyncStatic: function(fn, options) {
		var u = this;
		options = options || {};

		describe('calls callback synchronously', function() {
			u.testSync(function(handler, cb) {
				var p = fn(handler);
				cb(p);
			}, options.handler);
		});
	}
};
