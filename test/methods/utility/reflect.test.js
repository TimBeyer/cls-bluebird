/*
 * cls-bluebird tests
 * Tests for .reflect()
 */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.reflect()', function(u) {
	u.testSetReturnsPromiseProtoReceivingNothing(function(p) {
		return p.reflect();
	}, {passThrough: false}); // TODO Find better way to deal with this
});
