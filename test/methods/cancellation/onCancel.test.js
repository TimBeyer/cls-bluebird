/*
 * cls-bluebird tests
 * Tests for `onCancel` handler in `new Promise()`
 */

/* global describe, before, after */

// Imports
var runTests = require('../../support');

// Run tests

runTests('onCancel handler in new Promise()', function(u, Promise) {
	// NB `onCancel` handler does not exist in bluebird v2
	var thisDescribe = (u.bluebirdVersion === 2 ? describe.skip : describe);

	before(function() {
		if (u.bluebirdVersion === 3) Promise.config({cancellation: true});
	});

	after(function() {
		if (u.bluebirdVersion === 3) Promise.config({cancellation: false});
	});

	thisDescribe('binds callback when promise', function() {
		describeSet(function(fulfill, attach, expectedCalls) {
			var testFn = makeTestFn(fulfill, attach, expectedCalls);
			u.testBound(testFn, undefined, undefined, {expectedCalls: expectedCalls});
		});
	});

	thisDescribe('callback runs in context when promise', function() {
		describeSet(function(fulfill, attach, expectedCalls) {
			var testFn = makeTestFn(fulfill, attach, expectedCalls);
			u.testRunContext(testFn, undefined, undefined, {expectedCalls: expectedCalls});
		});
	});

	function makeTestFn(fulfill, attach, expectedCalls) {
		return function(handler, ignore, cb) { // jshint ignore:line
			var p = new Promise(function(resolve, reject, onCancel) {
				onCancel(handler);
				fulfill(resolve, reject);
			});
			u.inheritRejectStatus(p, fulfill);

			attach(function() {
				u.runInContext(function() {
					p.cancel();
				});

				// A cancelled promise cannot be chained onto, so new promise passed to callback.
				if (expectedCalls) p = Promise.resolve();

				// NB `onCancel` handler is executed asynchronously.
				// https://github.com/petkaantonov/bluebird/issues/1177
				cb(p);
			}, p);
		};
	}

	function describeSet(fn) {
		describeResolveReject(function(resolver) {
			describeSchedule(function(schedule) {
				var fulfill = function(resolve, reject) {
					schedule(function() {
						resolver(resolve, reject);
					});
				};
				u.inheritRejectStatus(fulfill, resolver);
				fulfill._async = schedule._async;

				describe('and `.cancel()` called', function() {
					u.describeAttach(function(attach) {
						var expectedCalls = ((fulfill._async && !attach._async) ? 1 : 0);
						fn(fulfill, attach, expectedCalls);
					});
				});
			});
		});
	}

	function describeResolveReject(fn) {
		describe('resolved', function() {
			fn(function(resolve) {
				resolve(u.makeValue());
			});
		});

		describe('rejected', function() {
			var resolver = function(resolve, reject) { // jshint ignore:line
				reject(u.makeError());
			};
			u.setRejectStatus(resolver);
			fn(resolver);
		});
	}

	function describeSchedule(fn) {
		describe('sync', function() {
			fn(function(fn) {
				fn();
			});
		});

		describe('async', function() {
			var schedule = function(fn) {
				setImmediate(function() {
					fn();
				});
			};
			schedule._async = true;
			fn(schedule);
		});
	}
});
