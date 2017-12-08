/*
 * cls-bluebird tests
 * Tests for .tapCatch()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.tapCatch()', function(u) {
	describe('with 1st arg', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.tapCatch(handler);
		}, {catches: true, continues: false, passThrough: true});
	});

	describe('with 2nd arg', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.tapCatch(Error, handler);
		}, {catches: true, continues: false, passThrough: true});
	});
}, function(u) {
	// Skip tests in bluebird 2 - method does not exist
	return u.bluebirdVersion === 2;
});
