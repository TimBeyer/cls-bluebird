/*
 * cls-bluebird tests
 * Tests for .done()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

// TODO Add tests for progression handler
runTests('.done()', function(u, Promise) {
	describe('resolve handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			p.done(handler);

			// `.done()` returns undefined so return new promise resolved async
			return new Promise(function(resolve) { setImmediate(resolve); });
		}, {skipUncalled: true, noPromiseTest: true});
	});

	describe('reject handler', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			p.done(undefined, handler);

			// `.done()` returns undefined so return new promise resolved async
			return new Promise(function(resolve) { setImmediate(resolve); });
		}, {catches: true, noPromiseTest: true});
	});

	describe('resolve and reject handlers', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			p.done(handler, handler);

			// `.done()` returns undefined so return new promise resolved async
			return new Promise(function(resolve) { setImmediate(resolve); });
		}, {continues: true, catches: true, expectedBindings: 2, noPromiseTest: true});
	});
});
