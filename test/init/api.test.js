/*
 * cls-bluebird tests
 * Test API
 */

/* global describe, it */

// Modules
var cls = require('continuation-local-storage'),
	Bluebird2 = require('bluebird2'),
	Bluebird3 = require('bluebird3'),
	expect = require('chai').expect;

// Imports
var runTests = require('../support'),
	clsBluebird = require('../../lib');

// Create CLS namespace
var ns = cls.createNamespace('test');

// Run tests

runTests('API', function() {
	describe('Checks for valid namespace and', function() {
		it('works if provided', function() {
			clsBluebird(ns);
		});

		it('throws if provided undefined', function() {
			expect(function() {
				clsBluebird();
			}).to.throw('Must provide CLS namespace to patch Bluebird against');
		});

		it('throws if provided null', function() {
			expect(function() {
				clsBluebird(null);
			}).to.throw('Must provide CLS namespace to patch Bluebird against');
		});

		it('throws if provided function', function() {
			expect(function() {
				clsBluebird(function() {});
			}).to.throw('Must provide CLS namespace to patch Bluebird against');
		});

		it('throws if provided object', function() {
			expect(function() {
				clsBluebird({});
			}).to.throw('Must provide CLS namespace to patch Bluebird against');
		});

		it('throws if provided promise constructor', function() {
			expect(function() {
				clsBluebird(Bluebird3);
			}).to.throw('Must provide CLS namespace to patch Bluebird against');
		});
	});

	describe('Checks for valid promise constructor and', function() {
		it('works if provided bluebird v2 constructor', function() {
			clsBluebird(ns, Bluebird2);
		});

		it('works if provided bluebird v3 constructor', function() {
			clsBluebird(ns, Bluebird3);
		});

		// NB skip this test on Node v0.10.x as global.Promise does not exist
		(process.version.slice(0, 6) === 'v0.10.' ? it.skip : it)('throws if provided native JS promise constructor', function() {
			expect(function() {
				clsBluebird(ns, global.Promise);
			}).to.throw('Promise implementation provided must be Bluebird');
		});

		it('throws if provided other promise constructor', function() {
			expect(function() {
				var FakePromise = function() {};
				FakePromise.prototype.then = function() {};
				clsBluebird(ns, FakePromise);
			}).to.throw('Promise implementation provided must be Bluebird');
		});

		it('throws if provided bluebird v2 promise', function() {
			expect(function() {
				clsBluebird(ns, new Bluebird2(function() {}));
			}).to.throw('Promise implementation provided must be Bluebird');
		});

		it('throws if provided bluebird v3 promise', function() {
			expect(function() {
				clsBluebird(ns, new Bluebird3(function() {}));
			}).to.throw('Promise implementation provided must be Bluebird');
		});

		it('throws if provided function', function() {
			expect(function() {
				clsBluebird(ns, function() {});
			}).to.throw('Promise implementation provided must be Bluebird');
		});

		it('throws if provided object', function() {
			expect(function() {
				clsBluebird(ns, {});
			}).to.throw('Promise implementation provided must be Bluebird');
		});

		it('throws if provided CLS namespace', function() {
			expect(function() {
				clsBluebird(ns, ns);
			}).to.throw('Promise implementation provided must be Bluebird');
		});
	});
});
