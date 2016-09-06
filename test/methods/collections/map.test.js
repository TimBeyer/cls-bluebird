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
			return Promise.map(value, handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true});
	});

	describe('with concurrency option', function() {
		u.testGroupStaticAsyncArrayHandler(function(value, handler) {
			return Promise.map(value, handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
	});
});

runTests('.map()', function(u) {
	describe('default concurrency', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.map(handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true});
	});

	describe('with concurrency option', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.map(handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
	});
});
