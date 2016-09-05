/*
 * cls-bluebird tests
 * Tests for Promise.delay() / .delay()
 */

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.delay()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingValue(function(value) {
		// NB In bluebird v2 arguments are `(value, ms)`, in bluebird v3 `(ms, value)`
		if (u.bluebirdVersion === 2) return Promise.delay(value, 1);
		return Promise.delay(1, value);
	});
});

runTests('.delay()', function(u) {
	u.testSetReturnsPromiseProtoReceivingNothing(function(p) {
		return p.delay(1);
	}, {passThrough: true});
});
