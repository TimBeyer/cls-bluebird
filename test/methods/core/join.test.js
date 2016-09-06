/*
 * cls-bluebird tests
 * Tests for .join()
 */

// Imports
var runTests = require('../../support');

// Run tests
runTests('Promise.join()', function(u, Promise) {
	/*
	 * NB Due to bug in bluebird v2
	 * https://github.com/petkaantonov/bluebird/issues/1153
	 * `Promise.join()` calls the callback synchronously if input is
	 * only values or resolved promises, but async if any promises are pending.
	 * So async calling test is skipped to allow for this.
	 * TODO Change test once bug is fixed
	 */
	u.testGroupStaticAsyncArrayHandler(function(array, handler) {
		array = array.concat([handler]);
		return Promise.join.apply(Promise, array);
	}, {noUndefinedValue: true, literal: true, oneCallback: true, noAsyncTest: u.bluebirdVersion === 2});
});
