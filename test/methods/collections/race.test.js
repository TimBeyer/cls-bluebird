/*
 * cls-bluebird tests
 * Tests for Promise.race()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.race()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingArray(function(value) {
		return Promise.race(value);
	}, {noUndefined: true});
});
