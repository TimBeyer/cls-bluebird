/*
 * cls-bluebird tests
 * Tests for .throw() / .thenThrow()
 */

/* global it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('.throw()', function(u) {
	u.testSetReturnsPromiseProtoReceivingNothing(function(p) {
		var newP = p.throw(u.makeError());
		u.setRejectStatus(newP);
		return newP;
	}, {passThrough: false}); // TODO Find better way to deal with this
});

runTests('.thenThrow()', function(u, Promise) { // jshint ignore:line
	it('is alias of .throw()', function() {
		expect(Promise.prototype.thenThrow).to.equal(Promise.prototype.throw);
	});
});
