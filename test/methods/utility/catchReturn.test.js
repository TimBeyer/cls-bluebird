/*
 * cls-bluebird tests
 * Tests for .catchReturn()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.catchReturn()', function(u) {
	// NB `.catchReturn()` method does not exist in bluebird v2
	var thisDescribe = (u.bluebirdVersion === 2 ? describe.skip : describe);

	thisDescribe('with 1st arg', function() {
		u.testSetReturnsPromiseProtoReceivingValue(function(p, value) {
			// Where value is a rejected promise created from another promise constructor,
			// results in an unhandled rejection.
			// https://github.com/petkaantonov/bluebird/issues/1186
			// TODO Remove this line if issue resolved
			if (u.getRejectStatus(value)) u.suppressUnhandledRejections(value);

			return p.catchReturn(value);
		}, {catches: true});
	});

	thisDescribe('with 2nd arg', function() {
		u.testSetReturnsPromiseProtoReceivingValue(function(p, value) {
			// TODO Remove this line if issue resolved (see above)
			if (u.getRejectStatus(value)) u.suppressUnhandledRejections(value);

			return p.catchReturn(Error, value);
		}, {catches: true});
	});
});
