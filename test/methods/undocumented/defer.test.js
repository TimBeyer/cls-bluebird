/*
 * cls-bluebird tests
 * Tests for Promise.defer() / Promise.pending()
 */

/* global describe, it */

// Modules
var expect = require('chai').expect;

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.defer()', function(u, Promise) {
	describe('returns instance of patched Promise constructor when', function() {
		describe('resolved with', function() {
			u.describeValues(function(makeValue) {
				describe('and resolve called', function() {
					u.describeAttachSimple(function(attach) {
						u.testIsPromise(function(cb) {
							var deferred = Promise.defer();
							var p = deferred.promise;

							attach(function() {
								deferred.resolve(makeValue());
								u.inheritRejectStatus(p, makeValue);
								cb(p);
							});
						});
					});
				});
			});
		});

		describe('rejected with error', function() {
			u.describeAttachSimple(function(attach) {
				u.testIsPromise(function(cb) {
					var deferred = Promise.defer();
					var p = deferred.promise;

					attach(function() {
						deferred.reject(u.makeError());
						u.setRejectStatus(p);
						cb(p);
					});
				});
			});
		});
	});
});

runTests('Promise.pending()', function(u, Promise) { // jshint ignore:line
	it('is alias of Promise.defer()', function() {
		expect(Promise.pending).to.equal(Promise.defer);
	});
});
