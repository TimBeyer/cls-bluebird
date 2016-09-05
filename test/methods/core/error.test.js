/*
 * cls-bluebird tests
 * Tests for .error()
 */

// Imports
var runTests = require('../../support');

// Run tests

runTests('.error()', function(u) {
	// NB In bluebird v3 handler is not bound.
	// `.error()` calls `.catch()` synchronously which calls `.then()` synchronously but with proxy handler.
	// So test only for indirect binding.
	u.testGroupProtoAsyncHandler(function(p, handler) {
		return p.error(handler);
	}, {catches: true, noUndefined: true, bindIndirect: (u.bluebirdVersion === 3)});
});
