/*
 * cls-bluebird tests
 * Tests for .spread()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.spread()', function(u) {
	describe('resolve handler', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.spread(handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true, oneCallback: true});
	});

	var thisDescribe = (u.bluebirdVersion === 2 ? describe : describe.skip);
	thisDescribe('reject handler', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.spread(undefined, handler);
		}, {catches: true, noUndefinedValue: true, noUndefinedHandler: true, oneCallback: true});
	});

	thisDescribe('resolve and reject handlers', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.spread(handler, handler);
		}, {continues: true, catches: true, expectedBindings: 2, noUndefinedValue: true, noUndefinedHandler: true, oneCallback: true});
	});
});
