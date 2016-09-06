/*
 * cls-bluebird tests
 * Tests for Promise.filter() / .filter()
 */

/* global describe */

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.filter()', function(u, Promise) {
	describe('default concurrency', function() {
		u.testGroupStaticAsyncArrayHandler(function(value, handler) {
			return Promise.filter(value, handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true});
	});

	describe('with concurrency option', function() {
		u.testGroupStaticAsyncArrayHandler(function(value, handler) {
			return Promise.filter(value, handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
	});
});

runTests('.filter()', function(u) {
	describe('default concurrency', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.filter(handler);
		}, {noUndefinedValue: true, noUndefinedHandler: true});
	});

	describe('with concurrency option', function() {
		u.testGroupProtoAsyncArrayHandler(function(p, handler) {
			return p.filter(handler, {concurrency: 1});
		}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
	});
});
