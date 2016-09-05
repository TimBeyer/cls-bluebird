/*
 * cls-bluebird tests
 * Tests for Promise.all() / .all()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.all()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingArray(function(value) {
		return Promise.all(value);
	}, {noUndefined: true});
});

runTests('.all()', function(u) {
	u.testSetReturnsPromiseProtoOnArrayReceivingNothing(function(p) {
		return p.all();
	}, {noUndefined: true});
});
