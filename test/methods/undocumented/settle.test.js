/*
 * cls-bluebird tests
 * Tests for Promise.settle() / .settle()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.settle()', function(u, Promise) {
	u.testSetReturnsPromiseStaticReceivingArray(function(value) {
		var p = Promise.settle(value);
		if (!value._array) u.inheritRejectStatus(p, value);
		return p;
	}, {noUndefined: true, noReject: true});
});

runTests('.settle()', function(u) {
	u.testSetReturnsPromiseProtoOnArrayReceivingNothing(function(p) {
		var newP = p.settle();
		if (!p._array) u.inheritRejectStatus(newP, p);
		return newP;
	}, {noUndefined: true, noReject: true});
});
