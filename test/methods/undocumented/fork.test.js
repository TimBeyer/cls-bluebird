/*
 * cls-bluebird tests
 * Tests for .fork()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

// TODO Add tests for progression handler
runTests('.fork()', function(u) {
	// `.fork()` does not exist in bluebird v3
	var thisDescribe = (u.bluebirdVersion === 2 ? describe : describe.skip);

	thisDescribe('resolve handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.fork(handler);
		});
	});

	thisDescribe('reject handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.fork(undefined, handler);
		}, {catches: true});
	});

	thisDescribe('resolve and reject handlers', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.fork(handler, handler);
		}, {continues: true, catches: true, expectedBindings: 2});
	});
});
