/*
 * cls-bluebird tests
 * Tests for .tap()
 */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.tap()', function(u) {
	u.testGroupProtoAsyncHandler(function(p, handler) {
		return p.tap(handler);
	});
});
