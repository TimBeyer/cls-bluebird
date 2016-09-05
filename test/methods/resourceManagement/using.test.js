/*
 * cls-bluebird tests
 * Tests for Promise.using() + .disposer()
 */

/* global describe */

// Modules
var _ = require('lodash');

// Imports
var runTests = require('../../support');

// Run tests

runTests('Promise.using()', function(u, Promise) {
	// Tests for `Promise.using( disposer, disposer, disposer, handler )`
	describe('passed several arguments', function() {
		testGroup(function(disposers, handler) {
			return Promise.using.apply(Promise, disposers.concat([handler]));
		}, u, Promise);
	});

	// Tests for `Promise.using( [ disposer, disposer, disposer ], handler )`
	describe('passed array', function() {
		testGroup(function(disposers, handler) {
			return Promise.using(disposers, handler);
		}, u, Promise);
	});
});

/**
 * Run all tests on use of `Promise.using()`.
 * `fn` provided should take provided `disposers` and `handler` and create a promise and return the promise.
 *
 * @param {Function} fn - Function that creates a promise using `Promise.using()`
 * @param {Object} u - Utils object
 * @param {Function} Promise - Bluebird constructor
 * @returns {undefined}
 */
function testGroup(fn, u, Promise) {
	// Test always returns Promise
	describe('returns instance of patched Promise constructor when disposer input is', function() {
		describeSet(function(makePromise, handler, attach, expectedCalls) {
			if (!expectedCalls) {
				// Promise rejects - neither disposer handler nor using handler should be called
				testIsPromise(fn, makePromise, handler, undefined, attach, 0, u, Promise);
			} else {
				// Promise resolves - disposer handler and using handler should both be called
				describe('and disposer', function() {
					u.describeHandlers(function(disposerHandler) {
						// Skip disposer handlers that throw or reject (they cause node to exit immediately)
						if (u.getRejectStatus(disposerHandler)) return;

						testIsPromise(fn, makePromise, handler, disposerHandler, attach, 1, u, Promise);
					});
				});
			}
		}, u);
	});

	// Test calls `using` callback async
	describe('calls `using` callback asynchronously when disposer input is', function() {
		describeSet(function(makePromise, handler, attach, expectedCalls) {
			testUsingCallbackAsync(fn, makePromise, handler, attach, expectedCalls, u, Promise);
		}, u);
	});

	// Test calls `disposer` callback async
	describe('calls `disposer` callback asynchronously when disposer input is', function() {
		describeSet(function(makePromise, handler, attach, expectedCalls) {
			testDisposerCallbackAsync(fn, makePromise, handler, attach, expectedCalls, u, Promise);
		}, u);
	});

	// Test `using` callback bound to CLS context
	describe('binds `using` callback when disposer input is', function() {
		describeSet(function(makePromise, handler, attach, expectedCalls) {
			testUsingBound(fn, makePromise, handler, attach, expectedCalls, u, Promise);
		}, u);
	});

	// Test `disposer` callback bound to CLS context
	describe('binds `disposer` callback when disposer input is', function() {
		describeSet(function(makePromise, handler, attach, expectedCalls) {
			testDisposerBound(fn, makePromise, handler, attach, expectedCalls, u, Promise);
		}, u);
	});

	// Test `using` callback executed in correct CLS context
	describe('`using` callback runs in context when disposer input is', function() {
		describeSet(function(makePromise, handler, attach, expectedCalls) {
			testUsingContext(fn, makePromise, handler, attach, expectedCalls, u, Promise);
		}, u);
	});

	// Test `disposer` callback executed in correct CLS context
	describe('`disposer` callback runs in context when disposer input is', function() {
		describeSet(function(makePromise, handler, attach, expectedCalls) {
			testDisposerContext(fn, makePromise, handler, attach, expectedCalls, u, Promise);
		}, u);
	});
}

/**
 * Create `describe` test groups for different promises, handlers and attach sync/async.
 *
 * `testFn` is called with `makePromise` function, `handler` function, `attach` function and num `expectedCalls`
 * (`handler` may be undefined).
 *
 * @param {Function} testFn - Function to call for each `describe`
 * @param {Object} u - Utils object
 * @returns {undefined}
 */
function describeSet(testFn, u) {
	u.describeMainPromises(function(makePromise) {
		describe('and using follows disposer creation', function() {
			u.describeAttach(function(attach) {
				if (u.getRejectStatus(makePromise)) {
					// Promise rejects - neither disposer handler nor using handler should be called
					describe('and handlers are ignored', function() {
						testFn(makePromise, undefined, attach, 0);
					});
				} else {
					// Promise resolved - disposer handler and using handler should both be called
					describe('and handler', function() {
						u.describeHandlers(function(handler) {
							testFn(makePromise, handler, attach, 1);
						});
					});
				}
			});
		});
	});
}

/**
 * Run a function with handler and disposer handlers and check handlers called expected number of times.
 * Calls `fn` immediately passing:
 *   - wrapped `handler`
 *   - array of wrapped disposer handlers `disposerHandlers`
 *   - test object `t`
 *   - callback `cb`
 *
 * `fn` should call callback `cb` with created promise.
 *
 * @param {Function} fn - Function to run.
 * @param {Function} [handler] - Handler function - will be wrapped and passed to `fn`
 * @param {Array} disposerHandlers - Array of disposer handler function - will all be wrapped and passed to `fn`
 * @param {number} [expectedCalls=1] - Number of times expect handler to be called
 * @param {Object} u - Utils object
 * @param {boolean} [options] - Options object
 * @param {boolean} [options.multiple=false] - Set `true` to use `u.testMultiple` rather than `u.test`
 * @returns {undefined}
 */
function testHandlersCalled(fn, handler, disposerHandlers, expectedCalls, u, options) {
	options = options || {};

	u[options.multiple ? 'testMultiple' : 'test'](function(t) {
		// Create wrapped handler
		var called = 0;

		var handlerWrapped = u.wrapHandler(handler, function() {
			called++;
		});

		// Create wrapped disposer handlers
		var disposerCalled = [];

		var disposerHandlersWrapped = disposerHandlers.map(function(handler, i) {
			disposerCalled[i] = 0;

			return u.wrapHandler(handler, function() {
				disposerCalled[i]++;
			});
		});

		// Run test function with handler and disposer handlers
		fn(handlerWrapped, disposerHandlersWrapped, t, function(p) {
			// Check handler and disposer handlers were called as expected
			t.done(p, function() {
				if (!called && expectedCalls !== 0) t.error(new Error('Callback not called'));
				if (called !== expectedCalls) t.error(new Error('Callback called ' + called + ' times'));

				disposerCalled.forEach(function(called) {
					if (!called && expectedCalls !== 0) t.error(new Error('Disposer callback not called'));
					if (called !== expectedCalls) t.error(new Error('Disposer callback called ' + called + ' times'));
				});
			});
		});
	});
}

/*
 * Test functions
 */

function testIsPromise(fn, makePromise, handler, disposerHandler, attach, expectedCalls, u, Promise) {
	testHandlersCalled(function(handler, disposerHandlers, t, cb) {
		var disposers = makeDisposers(makePromise, disposerHandlers, u, Promise);

		attach(function() {
			var p = fn(disposers, handler);
			u.inheritRejectStatus(p, expectedCalls ? handler : makePromise);

			t.error(u.checkIsPromise(p));

			cb(p);
		}, disposers._promise);
	}, handler, [disposerHandler, disposerHandler, disposerHandler], expectedCalls, u);
}

function testUsingCallbackAsync(fn, makePromise, handler, attach, expectedCalls, u, Promise) {
	testHandlersCalled(function(handler, disposerHandlers, t, cb) {
		var disposers = makeDisposers(makePromise, disposerHandlers, u, Promise);

		var sync = true;
		handler = u.wrapHandler(handler, function() {
			if (sync) t.error(new Error('Callback called synchronously'));
		});

		attach(function() {
			var p = fn(disposers, handler);
			u.inheritRejectStatus(p, expectedCalls ? handler : makePromise);
			sync = false;
			cb(p);
		}, disposers._promise);
	}, handler, [undefined, undefined, undefined], expectedCalls, u);
}

function testDisposerCallbackAsync(fn, makePromise, handler, attach, expectedCalls, u, Promise) {
	testHandlersCalled(function(handler, disposerHandlers, t, cb) {
		var promises = makePromises(makePromise, disposerHandlers, u, Promise);

		var sync = true;
		var disposers = promises.map(function(p, i) {
			var handler = u.wrapHandler(disposerHandlers[i], function() {
				if (sync) t.error(new Error('Callback called synchronously'));
			});

			return p.disposer(handler);
		});

		var handlerWrapped = function() {
			try {
				var result = handler.apply(this, arguments);
				sync = false;
				return result;
			} catch (err) {
				sync = false;
				throw err;
			}
		};
		u.inheritRejectStatus(handlerWrapped, handler);

		attach(function() {
			var p = fn(disposers, handlerWrapped);
			u.inheritRejectStatus(p, expectedCalls ? handler : makePromise);
			cb(p);
		}, promises._promise);
	}, handler, [undefined, undefined, undefined], expectedCalls, u);
}

function testUsingBound(fn, makePromise, handler, attach, expectedCalls, u, Promise) {
	testHandlersCalled(function(handler, disposerHandlers, t, cb) {
		var disposers = makeDisposers(makePromise, disposerHandlers, u, Promise);

		u.runInContext(function(context) {
			handler = u.wrapHandler(handler, function() {
				t.error(u.checkBound(handler, context, {noIndirect: true}));
				checkIndirectBinding(handler, disposerHandlers, u, t);
			});

			attach(function() {
				var p = fn(disposers, handler);
				u.inheritRejectStatus(p, expectedCalls ? handler : makePromise);

				t.error(u.checkBound(handler, context, {noIndirect: true}));
				checkIndirectBinding(handler, disposerHandlers, u, t);
				checkUnalteredMethods(p, Promise, t);

				cb(p);
			}, disposers._promise);
		});
	}, handler, [undefined, undefined, undefined], expectedCalls, u);
}

function testDisposerBound(fn, makePromise, handler, attach, expectedCalls, u, Promise) {
	testHandlersCalled(function(handler, disposerHandlers, t, cb) {
		var promises = makePromises(makePromise, disposerHandlers, u, Promise);

		var disposers = promises.map(function(p, i) {
			return u.runInContext(function(context) {
				var handler = u.wrapHandler(disposerHandlers[i], function() {
					t.error(u.checkBound(handler, context, {noIndirect: true}));
				});

				disposerHandlers[i] = handler;

				var disposer = p.disposer(handler);

				t.error(u.checkBound(handler, context, {noIndirect: true}));

				return disposer;
			});
		});

		// Wrap `using` handler to check no indirect binding performed
		handler = u.wrapHandler(handler, function() {
			checkIndirectBinding(handler, disposerHandlers, u, t);
		});

		attach(function() {
			var p = fn(disposers, handler);
			u.inheritRejectStatus(p, expectedCalls ? handler : makePromise);
			checkIndirectBinding(handler, disposerHandlers, u, t);
			checkUnalteredMethods(p, Promise, t);
			cb(p);
		}, promises._promise);
	}, handler, [undefined, undefined, undefined], expectedCalls, u);
}

function checkIndirectBinding(handler, disposerHandlers, u, t) {
	// Check total bindings as expected
	if (u.ns._bound.length !== disposerHandlers.length + 1) t.error(new Error('Total bindings wrong (' + u.ns._bound.length + ')'));

	// Check bindings to correct functions
	var wrongBound = _.find(u.ns._bound, function(bound) {
		return bound.fn !== handler && disposerHandlers.indexOf(bound.fn) === -1;
	});
	if (wrongBound) t.error(new Error('Unnecessary indirect binding performed'));
}

function checkUnalteredMethods(p, Promise, t) {
	// Check patch leaves `Promise.all`, `Promise.settle` as was
	if (Promise.all.__wrapped) t.error(new Error('Patch left Promise.all modified'));
	if (Promise.settle.__wrapped) t.error(new Error('Patch left Promise.settle modified'));

	// Check `.then()` and `.lastly()` methods on resulting promise are patched
	if (!p.then.__wrapped) t.error(new Error('Patch disabled `.then` patch'));
	if (!p.lastly.__wrapped) t.error(new Error('Patch disabled `.lastly` patch'));
}

function testUsingContext(fn, makePromise, handler, attach, expectedCalls, u, Promise) {
	testHandlersCalled(function(handler, disposerHandlers, t, cb) {
		var disposers = makeDisposers(makePromise, disposerHandlers, u, Promise);

		u.runInContext(function(context) {
			handler = u.wrapHandler(handler, function() {
				t.error(u.checkRunContext(context));
			});

			attach(function() {
				var p = fn(disposers, handler);
				u.inheritRejectStatus(p, expectedCalls ? handler : makePromise);
				cb(p);
			}, disposers._promise);
		});
	}, handler, [undefined, undefined, undefined], expectedCalls, u, {multiple: true});
}

function testDisposerContext(fn, makePromise, handler, attach, expectedCalls, u, Promise) {
	testHandlersCalled(function(handler, disposerHandlers, t, cb) {
		var promises = makePromises(makePromise, disposerHandlers, u, Promise);

		var disposers = promises.map(function(p, i) {
			return u.runInContext(function(context) {
				var handler = u.wrapHandler(disposerHandlers[i], function() {
					t.error(u.checkRunContext(context));
				});

				return p.disposer(handler);
			});
		});

		attach(function() {
			var p = fn(disposers, handler);
			u.inheritRejectStatus(p, expectedCalls ? handler : makePromise);
			cb(p);
		}, promises._promise);
	}, handler, [undefined, undefined, undefined], expectedCalls, u, {multiple: true});
}

/*
 * Helper functions
 */

function makePromises(makePromise, disposerHandlers, u, Promise) {
	var promises = disposerHandlers.map(function() {
		return makePromise();
	});

	var promiseAll = Promise.all(promises);
	u.suppressUnhandledRejections(promiseAll);

	promises._promise = promiseAll;

	return promises;
}

function makeDisposers(makePromise, disposerHandlers, u, Promise) {
	var promises = makePromises(makePromise, disposerHandlers, u, Promise);

	var disposers = promises.map(function(p, i) {
		return p.disposer(disposerHandlers[i]);
	});

	disposers._promise = promises._promise;

	return disposers;
}
