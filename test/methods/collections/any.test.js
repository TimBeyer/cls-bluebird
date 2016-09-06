/*
 * cls-bluebird tests
 * Tests for Promise.any() / .any()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.any()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingArray(function(value) {
		return Promise.any(value);
	}, {noUndefined: true, aggregateError: true});
});

runTests('.any()', function(u) {
	u.testSetReturnsPromiseProtoOnArrayReceivingNothing(function(p) {
		return p.any();
	}, {noUndefined: true, aggregateError: true});
});
