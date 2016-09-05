/*
 * cls-bluebird tests
 * Tests for Promise.method()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.method()', function(u, Promise) {
	describe('returns a function that', function() {
		// Main tests
		u.testGroupStaticSyncHandler(function(handler) {
			return (Promise.method(handler))();
		}, {noUndefined: true, noContextTest: true});

		// Test run in correct CLS context
		// Runs `Promise.method()` outside of CLS context, and runs resuting function within CLS context
		u.testSetCallbackContextStatic(function(handler, fn) {
			// `fn` here is result of running `preFn` (i.e. Promise.method-ified handler)
			return fn(handler);
		}, {
			preFn: function() {
				return Promise.method(function(handler) {
					return handler();
				});
			}
		});
	});
});
