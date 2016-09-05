/*
 * cls-bluebird tests
 * Tests for .catch()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('.catch()', function(u) {
	describe('with 1st arg', function() {
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.catch(handler);
		}, {catches: true});
	});

	describe('with 2nd arg', function() {
		// NB In bluebird v3 handler is not bound when on 2nd arg.
		// `.catch()` calls `.then()` synchronously but with proxy handler.
		// So test only for indirect binding.
		u.testGroupProtoAsyncHandler(function(p, handler) {
			return p.catch(Error, handler);
		}, {catches: true, noUndefined: true, bindIndirect: (u.bluebirdVersion === 3)});
	});
});

runTests('.caught()', function(u, Promise) { // jshint ignore:line
	it('is alias of .catch()', function() {
		expect(Promise.prototype.caught).to.equal(Promise.prototype.catch);
	});
});
