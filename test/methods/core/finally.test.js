/*
 * cls-bluebird tests
 * Tests for .finally()
 */

/* global it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('.finally()', function(u) {
	u.testGroupProtoAsyncHandler(function(p, handler) {
		return p.finally(handler);
	}, {catches: true, continues: true, passThrough: true});
});

runTests('.lastly()', function(u, Promise) { // jshint ignore:line
	it('is alias of .finally()', function() {
		expect(Promise.prototype.lastly).to.equal(Promise.prototype.finally);
	});
});
