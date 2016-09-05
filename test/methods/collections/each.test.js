/*
 * cls-bluebird tests
 * Tests for Promise.each() / .each()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.each()', function(u, Promise) {
	u.testGroupStaticAsyncArrayHandler(function(value, handler) {
		return Promise.each(value, handler);
	}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
});

runTests('.each()', function(u) {
	u.testGroupProtoAsyncArrayHandler(function(p, handler) {
		return p.each(handler);
	}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
});
