/*
 * cls-bluebird tests
 * Tests for Promise.reject()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.reject()', function(u, Promise) {
	describe('returns instance of patched Promise constructor when passed', function() {
		describe('error object', function() {
			u.testIsPromise(function(cb) {
				var p = Promise.reject(u.makeError());
				u.setRejectStatus(p);
				cb(p);
			});
		});
	});
});

runTests('Promise.rejected()', function(u, Promise) { // jshint ignore:line
	it('is alias of Promise.reject()', function() {
		expect(Promise.rejected).to.equal(Promise.reject);
	});
});
