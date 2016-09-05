/*
 * cls-bluebird tests
 * Tests for new Promise()
 */

/* global describe, it */

// Imports
var runTests = require('../../support');

// Run tests

runTests('new Promise()', function(u, Promise) {
	describe('returns instance of patched Promise constructor when', function() {
		describe('resolves', function() {
			u.describeAttachSimple(function(attach) {
				describe('with', function() {
					u.describeValues(function(makeValue) {
						u.testIsPromise(function(cb) {
							var p = new Promise(function(resolve) {
								attach(function() {
									resolve(makeValue());
								});
							});
							u.inheritRejectStatus(p, makeValue);
							cb(p);
						});
					});
				});
			});
		});

		describe('rejects', function() {
			u.describeAttachSimple(function(attach) {
				u.testIsPromise(function(cb) {
					var p = new Promise(function(resolve, reject) { // jshint ignore:line
						attach(function() {
							reject(u.makeError());
						});
					});
					u.setRejectStatus(p);
					cb(p);
				});
			});
		});

		it('unresolved', function(done) {
			var p = new Promise(function() {});
			done(u.checkIsPromise(p));
		});

		describe('handler throws', function() {
			u.testIsPromise(function(cb) {
				var p = new Promise(function() {
					throw u.makeError();
				});
				u.setRejectStatus(p);
				cb(p);
			});
		});
	});

	var testFn = function(handler) {
		return new Promise(handler);
	};

	u.testSetCallbackSyncStatic(testFn, {handler: function(resolve) { resolve(); }});

	u.testSetNotBoundStatic(testFn, {handler: function(resolve) { resolve(); }});

	u.testSetCallbackContextStatic(testFn, {handler: function(resolve) { resolve(); }});
});
