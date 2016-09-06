/*
 * cls-bluebird tests
 * Tests for .return() / .thenReturn()
 */

/* global it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('.return()', function(u) {
	u.testSetReturnsPromiseProtoReceivingValue(function(p, value) {
		// Where value is a rejected promise created from another promise constructor,
		// results in an unhandled rejection.
		// https://github.com/petkaantonov/bluebird/issues/1186
		// TODO Remove this line if issue resolved
		if (u.getRejectStatus(value)) u.suppressUnhandledRejections(value);

		return p.return(value);
	});
});

runTests('.thenReturn()', function(u, Promise) { // jshint ignore:line
	it('is alias of .return()', function() {
		expect(Promise.prototype.thenReturn).to.equal(Promise.prototype.return);
	});
});
