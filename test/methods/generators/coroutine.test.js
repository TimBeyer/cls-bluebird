/*
 * cls-bluebird tests
 * Tests for Promise.coroutine()
 */

/* global it */

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.coroutine()', function(u, Promise) {
	if (u.nodeVersion.slice(0, 2) !== '0.') {
		require('./coroutine.inc')(u, Promise.coroutine, 'coroutine');
	} else {
		it.skip('not supported by node version ' + u.nodeVersion);
	}
});
