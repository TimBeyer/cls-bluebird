/*
 * cls-bluebird tests
 * Tests for Promise.try()
 */

/* global it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.try()', function(u, Promise) {
	u.testGroupStaticSyncHandler(function(handler) {
		return Promise.try(handler);
	}, {noUndefined: true});
});

runTests('Promise.attempt()', function(u, Promise) { // jshint ignore:line
	it('is alias of Promise.try()', function() {
		expect(Promise.attempt).to.equal(Promise.try);
	});
});
