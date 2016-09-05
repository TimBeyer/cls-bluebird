/*
 * cls-bluebird tests
 * Tests for Promise.promisify(), Promise.promisifyAll() and Promise.fromNode()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.promisify()', function(u, Promise) {
	describe('returns a function that', function() {
		testGroup(function(handler) {
			return Promise.promisify(handler);
		}, u);
	});
});

runTests('Promise.promisifyAll()', function(u, Promise) {
	describe('creates a function that', function() {
		testGroup(function(handler) {
			return Promise.promisifyAll({foo: handler}).fooAsync;
		}, u);
	});
});

runTests('Promise.fromNode()', function(u, Promise) {
	testGroup(function(handler) {
		return function(h) {
			// NB `h` is to deal with run in context test
			return Promise.fromNode(function(cb) {
				if (h) return void handler(h, cb);
				handler(cb);
			});
		};
	}, u);
});

runTests('Promise.fromCallback()', function(u, Promise) { // jshint ignore:line
	// NB `Promise.fromCallback()` does not exist in bluebird v2.
	var thisIt = (u.bluebirdVersion === 2 ? it.skip : it);
	thisIt('is alias of Promise.fromNode()', function() {
		expect(Promise.fromCallback).to.equal(Promise.fromNode);
	});
});

/*
 * Helper functions
 */

function testGroup(fn, u) {
	// Test always returns promise
	describe('returns instance of patched Promise constructor when function', function() {
		it('does not call callback', function(done) {
			var p = fn(function() {})();
			done(u.checkIsPromise(p));
		});

		describeHandlers(function(handler) {
			u.testIsPromiseFromHandler(function(handler, cb) {
				var p = fn(handler)();
				u.inheritRejectStatus(p, handler);
				cb(p);
			}, handler);
		}, u);
	});

	// Test function called sync
	var runFn = function(handler) {
		return fn(handler)();
	};

	var handler = function(cb) {
		cb(null, u.makeValue());
	};

	u.testSetCallbackSyncStatic(runFn, {handler: handler});

	// Test function not bound
	u.testSetNotBoundStatic(runFn, {handler: handler});

	// Test run in correct CLS context
	// Runs `Promise.promisify()` outside of CLS context, and runs resuting function within CLS context
	u.testSetCallbackContextStatic(function(handler, fn) {
		// `fn` here is result of running `preFn` (i.e. Promise.promisify-ified handler)
		return fn(handler);
	}, {
		preFn: function() {
			return fn(function(handler, cb) {
				return handler(cb);
			});
		},
		handler: handler
	});
}

function describeHandlers(testFn, u) {
	describe('calls callback with value', function() {
		describe('sync', function() {
			testFn(function(cb) {
				cb(null, u.makeValue());
			});
		});

		describe('async', function() {
			testFn(function(cb) {
				setImmediate(function() {
					cb(null, u.makeValue());
				});
			});
		});
	});

	describe('calls callback with error', function() {
		describe('sync', function() {
			var handler = function(cb) {
				cb(u.makeError());
			};
			u.setRejectStatus(handler);
			testFn(handler);
		});

		describe('async', function() {
			var handler = function(cb) {
				setImmediate(function() {
					cb(u.makeError());
				});
			};
			u.setRejectStatus(handler);
			testFn(handler);
		});
	});

	describe('throws', function() {
		var handler = function() {
			throw u.makeError();
		};
		u.setRejectStatus(handler);
		testFn(handler);
	});
}
