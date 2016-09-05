/*
 * cls-bluebird tests
 * Tests for .timeout()
 */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.timeout()', function(u) {
	u.testSetReturnsPromiseProtoReceivingNothing(function(p) {
		return p.timeout(1000);
	}, {passThrough: true});
});
