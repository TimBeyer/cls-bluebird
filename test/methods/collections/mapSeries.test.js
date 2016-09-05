/*
 * cls-bluebird tests
 * Tests for Promise.mapSeries() / .mapSeries()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.mapSeries()', function(u, Promise) {
	u.testGroupStaticAsyncArrayHandler(function(value, handler) {
		return Promise.mapSeries(value, handler);
	}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
}, function(u) {
	// Skip tests in bluebird 2 - method does not exist
	return u.bluebirdVersion === 2;
});

runTests('.mapSeries()', function(u) {
	u.testGroupProtoAsyncArrayHandler(function(p, handler) {
		return p.mapSeries(handler);
	}, {noUndefinedValue: true, noUndefinedHandler: true, series: true});
}, function(u) {
	// Skip tests in bluebird 2 - method does not exist
	return u.bluebirdVersion === 2;
});
