/*
 * cls-bluebird tests
 * Tests for Promise.bind() / .bind()
 */

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.bind()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingValue(function(value) {
		return Promise.bind(value);
	});
});

runTests('.bind()', function(u) {
	u.testSetReturnsPromiseProtoReceivingValue(function(p, value) {
		return p.bind(value);
	});
});
