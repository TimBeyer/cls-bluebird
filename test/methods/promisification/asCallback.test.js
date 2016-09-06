/*
 * cls-bluebird tests
 * Tests for .asCallback() / .nodeify()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('.asCallback()', function(u) {
	describe('returns instance of patched Promise constructor when input promise is', function() {
		u.describeMainPromisesAttach(function(makePromise, attach) {
			u.testIsPromiseFromHandler(function(handler, cb) {
				var p = makePromise();

				attach(function() {
					var newP = p.asCallback(handler);
					cb(newP);
				}, p);
			});
		});
	});

	var fn = function(p, handler) {
		return p.asCallback(handler);
	};
	var options = {continues: true, catches: true, passthrough: true};

	u.testSetCallbackAsyncProto(fn, options);
	u.testSetBoundProto(fn, options);
	u.testSetCallbackContextProto(fn, options);
});

runTests('.nodeify()', function(u, Promise) { // jshint ignore:line
	it('is alias of .asCallback()', function() {
		expect(Promise.prototype.nodeify).to.equal(Promise.prototype.asCallback);
	});
});
