/*
 * cls-bluebird tests
 * Tests for Promise.map() / .map()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.map()', function(u, Promise) {
	describe('default concurrency', function() {
		u.testGroupStaticAsyncArrayHandler(function(value, handler) {
			suppressRejections(value, u);
			return Promise.map(value, handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true});
	});

	describe('with concurrency option', function() {
		u.testGroupStaticAsyncArrayHandler(function(value, handler) {
			suppressRejections(value, u);
			return Promise.map(value, handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
	});
});

runTests('.map()', function(u) {
	describe('default concurrency', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			suppressRejections(p, u);
			return p.map(handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true});
	});

	describe('with concurrency option', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			suppressRejections(p, u);
			return p.map(handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
	});
});

// Workaround for bug in Bluebird v3.5.1 where unhandled rejections
// created erroneously.
// See https://github.com/petkaantonov/bluebird/issues/1487
// TODO Remove this once issue resolved.
function suppressRejections(v, u) {
	if (v && typeof v.then === 'function' && u.getRejectStatus(v)) u.suppressUnhandledRejections(v);
}
