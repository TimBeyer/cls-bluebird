/*
 * cls-bluebird tests
 * Tests for Promise.spawn()
 */

 /* global it */

 // Imports
 var runTests = require('../../support');

 // Run tests

 runTests('Promise.spawn()', function(u, Promise) {
 	if (u.nodeVersion.slice(0, 2) !== '0.') {
 		require('./coroutine.inc')(u, function(fn) {
			return function(handler) {
				return Promise.spawn(fn.bind(null, handler));
			};
		});
 	} else {
 		it.skip('not supported by node version ' + u.nodeVersion);
 	}
 });
