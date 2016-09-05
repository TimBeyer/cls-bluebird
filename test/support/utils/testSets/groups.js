/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests.
 * Mixin to Utils prototype.
 */

// Modules
var _ = require('lodash');

// Exports

module.exports = {
	/**
	 * Run set of tests on a static method that takes a callback to ensure:
	 *   - always returns a Promise which is instance of patched Promise constructor
	 *   - callback is called synchronously
	 *   - callback is not bound to CLS context
	 *   - callback is run in correct CLS context
	 *
	 * `fn` is called with a `handler` function which should be attached as the callback to the method under test.
	 * `fn` should return the resulting promise.
	 * e.g. `return Promise.try(handler)`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined handler
	 * @param {boolean} [options.noContextTest=false] - Skip handler called in context test if true
	 * @returns {undefined}
	 */
	testGroupStaticSyncHandler: function(fn, options) {
		var u = this;

		// Conform options
		options = _.extend({
			noUndefined: false,
			noContextTest: false
		}, options);

		u.testSetReturnsPromiseStaticReceivingHandler(fn, options);
		u.testSetCallbackSyncStatic(fn);
		u.testSetNotBoundStatic(fn);
		if (!options.noContextTest) u.testSetCallbackContextStatic(fn);
	},

	/**
	 * Run set of tests on a prototype method that takes a callback to ensure:
	 *   - always returns a Promise which is instance of patched Promise constructor
	 *   - callback is called asynchronously
	 *   - callback is bound to CLS context
	 *   - callback is run in correct CLS context
	 *
	 * `fn` is called with a `promise` and a `handler` function.
	 * `fn` should:
	 *   - call the method under test on `promise` with `handler` as callback
	 *   - return the resulting promise.
	 * e.g. `return promise.then(handler)`
	 *
	 * If handler should be called when promise attached to resolves, `options.continues` should be true (default)
	 * If handler should be called when promise attached to rejects, `options.catches` should be true
	 * If handler passes through rejections, `options.passThrough` should be true (e.g. `promise.finally()`)
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.continues] - true if handler fires on resolved promise (default `!options.catches`)
	 * @param {boolean} [options.catches] - true if handler fires on rejected promise (default `false`)
	 * @param {boolean} [options.passThrough] - true if method passes through errors even if handler fires (default `false`)
	 * @param {boolean} [options.skipUncalled] - true if should skip cases where handler not called
	 * @param {boolean} [options.noUndefined] - true if method does not accept undefined handler (default `false`)
	 * @param {boolean} [options.noPromiseTest] - Skip returns promise test if true (default `false`)
	 * @param {boolean} [options.bindIndirect] - true if binding to CLS context is indirect (default `false`)
	 * @param {number} [options.expectedBindings] - Number of times handler should be bound to CLS context
	 * @returns {undefined}
	 */
	testGroupProtoAsyncHandler: function(fn, options) {
		var u = this;

		// Conform options
		options = _.extend({
			catches: false,
			passThrough: false,
			skipUncalled: false,
			noUndefined: false,
			noPromiseTest: false
		}, options);

		_.defaults(options, {continues: !options.catches});

		// Run tests
		if (!options.noPromiseTest) u.testSetReturnsPromiseProtoReceivingHandler(fn, options);
		u.testSetCallbackAsyncProto(fn, options);
		u.testSetBoundProto(fn, options);
		u.testSetCallbackContextProto(fn, options);
	},

	/**
	 * Run set of tests on a static method that takes an array/promise of an array and callback to ensure:
	 *   - always returns a Promise which is instance of patched Promise constructor
	 *   - callback is called asynchronously
	 *   - callback is bound to CLS context
	 *   - callback is run in correct CLS context
	 *
	 * `fn` is called with an `array` and `handler` function.
	 * `fn` should run the method under test providing array and callback, and return the resulting promise.
	 * e.g. `return Promise.map(array, handler)`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.noUndefinedHandler=false] - true if method does not accept undefined handler
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.literal=false] - true if method receives only array not promise of array (`Promise.join()`)
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`Promise.join()`)
	 * @param {boolean} [options.noAsyncTest] - Skip handler called async test if true (default `false`)
	 * @returns {undefined}
	 */
	testGroupStaticAsyncArrayHandler: function(fn, options) {
		var u = this;

		// Conform options
		options = _.defaults({
			continues: true,
			catches: false,
			passThrough: false
		}, options, {
			noUndefinedValue: false,
			noUndefinedHandler: false,
			series: false,
			literal: false,
			oneCallback: false,
			noAsyncTest: false
		});

		// Run tests
		u.testSetReturnsPromiseStaticReceivingArrayAndHandler(fn, options);
		u.testSetCallbackAsyncStaticArray(fn, _.defaults({skip: options.noAsyncTest}, options));
		u.testSetBoundStaticArray(fn, options);
		u.testSetCallbackContextStaticArray(fn, options);
	},

	/**
	 * Run set of tests on a prototype method chaining onto promise of an array that takes a callback.
	 * Tests ensure:
	 *   - always returns a Promise which is instance of patched Promise constructor
	 *   - callback is called asynchronously
	 *   - callback is bound to CLS context
	 *   - callback is run in correct CLS context
	 *
	 * `fn` is called with a `promise` and a `handler` function.
	 * `fn` should:
	 *   - call the method under test on `promise` with `handler` as callback
	 *   - return the resulting promise.
	 * e.g. `return promise.map(handler)`
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.continues] - true if handler fires on resolved promise (default `!options.catches`)
	 * @param {boolean} [options.catches] - true if handler fires on rejected promise (default `false`)
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.noUndefinedHandler=false] - true if method does not accept undefined handler
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`.spread()`)
	 * @param {number} [options.expectedBindings] - Number of times handler should be bound to CLS context
	 * @returns {undefined}
	 */
	testGroupProtoAsyncArrayHandler: function(fn, options) {
		var u = this;

		// Conform options
		options = _.extend({
			catches: false,
			noUndefinedValue: false,
			noUndefinedHandler: false,
			series: false,
			oneCallback: false
		}, options, {
			passThrough: false
		});

		_.defaults(options, {continues: !options.catches});

		// Run tests
		u.testSetReturnsPromiseProtoOnArrayReceivingHandler(fn, options);
		u.testSetCallbackAsyncProtoArray(fn, options);
		u.testSetBoundProtoArray(fn, options);
		u.testSetCallbackContextProtoArray(fn, options);
	}
};
