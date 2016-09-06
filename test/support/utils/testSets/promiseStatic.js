/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that static methods return a promise of correct type.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
	/**
	 * Run set of tests on a static method which receives a value to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `value`.
	 * `fn` should call the method being tested with `value`, and return resulting promise.
	 * e.g. `return Promise.resolve(value)`
	 *
	 * A different `value` is provided in each test:
	 *   - literal value
	 *   - undefined
	 *   - promise from various constructors, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @returns {undefined}
	 */
	testSetReturnsPromiseStaticReceivingValue: function(fn) {
		var u = this;
		describe('returns instance of patched Promise constructor when passed', function() {
			u.describeValues(function(makeValue) {
				u.testIsPromise(function(cb) {
					var value = makeValue();
					var p = fn(value);
					u.inheritRejectStatus(p, value);
					cb(p);
				});
			});
		});
	},

	/**
	 * Run set of tests on a static method which receives a handler to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a function `handler`.
	 * `fn` should call the method being tested with `handler`, and return resulting promise.
	 * e.g. `return Promise.try(handler)`
	 *
	 * A different `handler` is provided in each test, which returns:
	 *   - literal value
	 *   - undefined
	 *   - thrown error
	 *   - promise from various constructors, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} options.noUndefined - true if method does not accept undefined handler
	 * @returns {undefined}
	 */
	testSetReturnsPromiseStaticReceivingHandler: function(fn, options) {
		var u = this;
		describe('returns instance of patched Promise constructor when callback', function() {
			// Test undefined handler
			if (!options.noUndefined) {
				u.test('is undefined', function(t) {
					var p = fn(undefined);

					t.error(u.checkIsPromise(p));
					t.done(p);
				});
			}

			// Test handlers
			u.describeHandlers(function(handler) {
				u.testIsPromiseFromHandler(function(handler, cb) {
					var p = fn(handler);
					u.inheritRejectStatus(p, handler);
					cb(p);
				}, handler);
			});
		});
	},

	/**
	 * Run set of tests on a static method that takes an array or promise of an array
	 * to ensure always returns a promise inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `value`.
	 * `fn` should call the method being tested with `value`, and return resulting promise.
	 * e.g. `return Promise.all(value)`
	 *
	 * A different `value` is provided in each test:
	 *   - undefined
	 *   - array
	 *   - promises of different types
	 *     - resolved sync or async with
	 *       - undefined
	 *       - array
	 *     - rejected sync or async with error
	 *
	 * Arrays can have members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * If `options.noUndefined` is true, tests for undefined value and promises of undefined are skipped.
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @param {boolean} [options.object=false] - true if method takes object not array i.e. `Promise.props()`
	 * @param {boolean} [options.aggregateError] - true if method produces `AggregateError`s on rejection
	 * @param {boolean} [options.noReject] - true if method never produces a rejected promise i.e. `Promise.settle()`
	 * @returns {undefined}
	 */
	testSetReturnsPromiseStaticReceivingArray: function(fn, options) {
		var u = this;
		options = options || {};

		describe('returns instance of patched Promise constructor when passed', function() {
			u.describeArrayOrPromiseOfArrays(function(makeValue) {
				u.testIsPromise(function(cb) {
					var value = makeValue();

					// `_array` property needed for `Promise.settle()` test
					value._array = makeValue._array;

					var p = fn(value);
					if (!options.noReject) u.inheritRejectStatus(p, value);
					cb(p);
				}, {aggregateError: options.aggregateError});
			}, options);
		});
	},

	/**
	 * Run set of tests on a static method that takes an array or promise of an array and a handler
	 * to ensure always returns a promise inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `value` and a `handler`.
	 * `fn` should call the method being tested with `value`, attaching `handler` and return resulting promise.
	 * e.g. `return Promise.map(value, handler)`
	 *
	 * A different `value` is provided in each test:
	 *   - undefined
	 *   - array
	 *   - promises of different types
	 *     - resolved sync or async with
	 *       - undefined
	 *       - array
	 *     - rejected sync or async with error
	 *
	 * Arrays can have members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * If `options.noUndefined` is true, tests for undefined value and promises of undefined are skipped.
	 *
	 * Handlers return a resolved/rejected sync/asyc promise, literal value, undefined, or throw.
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires rejected promise
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.noUndefinedHandler=false] - true if method does not accept undefined handler
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.literal=false] - true if method receives only array not promise of array (`Promise.join()`)
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`Promise.join()`)
	 * @returns {undefined}
	 */
	testSetReturnsPromiseStaticReceivingArrayAndHandler: function(fn, options) {
		var u = this;

		describe('returns instance of patched Promise constructor when passed', function() {
			u[options.literal ? 'describeArrays' : 'describeArrayOrPromiseOfArrays'](function(makeValue) {
				describe('and handler', function() {
					// Test undefined handler
					if (!options.noUndefinedHandler) {
						u.test('is undefined', function(t) {
							var value = makeValue();
							var p = fn(value, undefined);
							u.inheritRejectStatus(p, value);

							t.error(u.checkIsPromise(p));
							t.done(p);
						});
					}

					// If handler should not be fired on this promise, check is not fired
					var handlerShouldBeCalled = u.getRejectStatus(makeValue) ? options.catches : options.continues;

					if (handlerShouldBeCalled) {
						u.describeHandlers(function(handler) {
							var expectedCalls = u.helperStaticArrayNumHandlerCalls(makeValue, handler, options);
							test(handler, expectedCalls, false);
						});
					} else {
						describe('is ignored', function() {
							test(undefined, 0, true);
						});
					}

					function test(handler, expectedCalls, passThrough) {
						u.testIsPromiseFromHandler(function(handler, cb) {
							var value = makeValue();

							// Workaround for bug in bluebird
							u.helperSuppressUnhandledRejectionsStaticArray(value, makeValue);

							var p = fn(value, handler);
							u.inheritRejectStatus(p, handler);
							if (passThrough && u.getRejectStatus(value)) u.setRejectStatus(p);
							cb(p);
						}, handler, {expectedCalls: expectedCalls});
					}
				});
			}, {noUndefined: options.noUndefinedValue});
		});
	}
};
