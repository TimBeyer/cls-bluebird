/*
 * cls-bluebird tests
 * Utilities
 * Test functions.
 * Mixin to Utils prototype.
 */

/* global it */

// Constants
var TEST_MULTIPLE_ROUNDS = 3;

// Exports
module.exports = {
	/**
	 * Register `it()` test with mocha which will run test function.
	 * Test function is passed a Test object with `.error()` and `.done()` methods.
	 * Like mocha's `it()` except passes a Test object rather than callback to the test function.
	 *
	 * @param {string} name - Test case name
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.aggregateError] - true if method produces `AggregateError`s on rejection
	 * @returns {undefined}
	 */
	test: function(name, fn, options) {
		var u = this;

		if (typeof name === 'function') {
			options = fn;
			fn = name;
			name = '';
		}

		it(name, function(done) {
			u._runTest(fn, done, options);
		});
	},

	/**
	 * Same as`u.test()` but runs the test in parallel multiple times.
	 * If all test runs pass, executes callback with no error.
	 * If any test run fails, executes callback with first error received.
	 * Waits for all test runs to complete before calling callback, even if an error is encountered.
	 *
	 * Test function is passed a Test object with `.error()` and `.done()` methods.
	 *
	 * @param {string} name - Name of test
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.aggregateError] - true if method produces `AggregateError`s on rejection
	 * @returns {undefined}
	 */
	testMultiple: function(name, fn, options) {
		var u = this;

		if (typeof name === 'function') {
			options = fn;
			fn = name;
			name = '';
		}

		it(name, function(done) {
			done = callbackAggregator(TEST_MULTIPLE_ROUNDS, done);

			for (var i = 0; i < TEST_MULTIPLE_ROUNDS; i++) {
				u._runTest(fn, done, options);
			}
		});
	},

	/**
	 * Run a test function.
	 * `fn` is called with a Test object, bound to provided `done` callback.
	 * If test function throws, error is passed to `done` callback.
	 * Otherwise completion of test is controlled by Test object's `.done()` method.
	 *
	 * @param {Function} fn - Test function
	 * @param {Function} done - Callback function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.aggregateError] - true if method produces `AggregateError`s on rejection
	 */
	_runTest: function(fn, done, options) {
		var Test = this.Test;
		var t = new Test(done, options);
		try {
			fn(t);
		} catch (err) {
			done(err);
		}
	}
};

/**
 * Return a callback function which calls superior callback when it's been called a number of times.
 * If called with no errors on any occasion, calls callback with no error.
 * If called with an error on any occasion, executes callback with first error.
 * Waits to be called expected number of times before calling callback, even if receives an early error.
 * (i.e. does not call superior callback immediately on receipt of an error)
 *
 * @param {number} numCallbacks - Number of times expects callback to be called
 * @param {Function} cb - Superior callback to be called with aggregate result
 * @returns {Function} - Callback function
 */
function callbackAggregator(numCallbacks, cb) {
	var err;

	return function(thisErr) {
		if (thisErr && !err) err = thisErr;
		numCallbacks--;
		if (!numCallbacks) cb(err);
	};
}
