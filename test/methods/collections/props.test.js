/*
 * cls-bluebird tests
 * Tests for Promise.props() / .props()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.props()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingArray(function(value) {
		return Promise.props(value);
	}, {object: true, noUndefined: true});
});

runTests('.props()', function(u) {
	u.testSetReturnsPromiseProtoOnArrayReceivingNothing(function(p) {
		return p.props();
	}, {object: true, noUndefined: true});
});
