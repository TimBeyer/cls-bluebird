/*
 * cls-bluebird tests
 * Tests for .catchThrow()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.catchThrow()', function(u) {
	// NB `.catchThrow()` method does not exist in bluebird v2
	var thisDescribe = (u.bluebirdVersion === 2 ? describe.skip : describe);

	thisDescribe('with 1st arg', function() {
		u.testSetReturnsPromiseProtoReceivingNothing(function(p) {
			return p.catchThrow(u.makeError());
		}, {passThrough: true});
	});

	thisDescribe('with 2nd arg', function() {
		u.testSetReturnsPromiseProtoReceivingNothing(function(p) {
			return p.catchThrow(Error, u.makeError());
		}, {passThrough: true});
	});
});
