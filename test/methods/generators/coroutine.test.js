/*
 * cls-bluebird tests
 * Tests for Promise.coroutine()
 */

/* global it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.coroutine()', function(u, Promise) {
	if (u.nodeVersion.slice(0, 2) !== '0.') {
		require('./coroutine.inc')(u, Promise.coroutine);
	} else {
		it.skip('not supported by node version ' + u.nodeVersion);
	}
});

runTests('Promise.coroutine.addYieldHandler()', function(u, Promise) { // jshint ignore:line
	it('is present', function() {
		expect(Promise.coroutine.addYieldHandler).to.be.a('function');
	});
});
