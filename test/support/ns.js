/*
 * cls-bluebird tests
 * Create a CLS namespace
 */

/* global beforeEach */

// Modules
var cls = require('continuation-local-storage'),
	shimmer = require('shimmer');

// Create CLS namespace
var ns = cls.createNamespace('test');
module.exports = ns;

/*
 * Shim namespace's `bind()` method to record when a function is bound.
 * The binding is recorded in `_bound` property created on the function.
 * The `_bound` property is an array with each occurance of a binding being added to the array.
 * Bindings also recorded in `ns._bound` array.
 */
shimmer.wrap(ns, 'bind', function(bind) {
	return function(fn, context) {
		// Record binding on function
		var originalFn = fn._originalFn || fn;
		if (!originalFn._bound) originalFn._bound = [];
		originalFn._bound.push({ns: ns, context: context || ns.active});

		// Record binding on namespace
		ns._bound.push({fn: originalFn, context: context || ns.active});

		// Call ns.bind()
		var fnBound = bind.call(this, fn, context);
		fnBound._originalFn = originalFn;
		return fnBound;
	};
});

// Reset ns._bound before each test
beforeEach(function() {
	ns._bound = [];
});
