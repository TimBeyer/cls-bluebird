/*
 * cls-bluebird tests
 * Tests for .get()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.get()', function(u) {
	describe('returns instance of patched Promise constructor when attached to promise', function() {
		describeSet(function(makePromise, makeValue, attach) {
			u.testIsPromise(function(cb) {
				var p;
				if (makeValue) {
					p = makePromise(function() {
						var value = makeValue();
						if (u.getRejectStatus(value)) u.suppressUnhandledRejections(value);
						return {a: value};
					});
				} else {
					p = makePromise();
				}

				attach(function() {
					var newP = p.get('a');
					u.inheritRejectStatus(newP, p);
					if (u.getRejectStatus(makeValue)) u.setRejectStatus(newP);
					cb(newP);
				}, p);
			});
		});
	});

	function describeSet(testFn) {
		u.describeMainPromisesAttach(function(makePromise, attach) {
			describe('when value is', function() {
				if (u.getRejectStatus(makePromise)) {
					describe('ignored', function() {
						testFn(makePromise, undefined, attach);
					});
				} else {
					u.describeValues(function(makeValue) {
						testFn(makePromise, makeValue, attach);
					});
				}
			});
		});
	}
});
