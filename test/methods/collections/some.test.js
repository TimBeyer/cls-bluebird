/*
 * cls-bluebird tests
 * Tests for Promise.some() / .some()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.some()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingArray(function(value) {
		return Promise.some(value, 2);
	}, {noUndefined: true, aggregateError: true});
});

runTests('.some()', function(u) {
	u.testSetReturnsPromiseProtoOnArrayReceivingNothing(function(p) {
		return p.some(2);
	}, {noUndefined: true, aggregateError: true});
});
