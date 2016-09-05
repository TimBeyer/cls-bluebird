/*
 * cls-bluebird tests
 * Tests for Promise.reduce() / .reduce()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.reduce()', function(u, Promise) {
	u.testGroupStaticAsyncArrayHandler(function(value, handler) {
		return Promise.reduce(value, handler, 1);
	}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
});

runTests('.reduce()', function(u) {
	u.testGroupProtoAsyncArrayHandler(function(p, handler) {
		return p.reduce(handler, 1);
	}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
});
