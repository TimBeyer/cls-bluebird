/*
 * cls-bluebird tests
 * Utilities
 * Functions to run a set of tests relating to testing that prototype methods return a promise of correct type.
 * Mixin to Utils prototype.
 */

/* global describe */

// Exports

module.exports = {
	/**
	 * Run set of tests on a prototype method which receives nothing ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `promise`.
	 * `fn` should call the method being tested on `promise`, and return resulting promise.
	 * e.g. `return promise.timeout()`
	 *
	 * A different `value` is provided in each test:
	 *   - literal value
	 *   - undefined
	 *   - promise from various constructors, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.passThrough] - true if method passes through errors even if handler fires
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoReceivingNothing: function(fn, options) {
		var u = this;
		options = options || {};

		describe('returns instance of patched Promise constructor when attached to promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				u.testIsPromise(function(cb) {
					var p = makePromise();

					attach(function() {
						var newP = fn(p);
						if (options.passThrough) u.inheritRejectStatus(newP, p);
						cb(newP);
					}, p);
				});
			});
		});
	},

	/**
	 * Run set of tests on a prototype method which receives a value to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `promise` and a `value`.
	 * `fn` should call the method being tested on `promise` with `value`, and return resulting promise.
	 * e.g. `return promise.bind(value)`
	 *
	 * A different `value` is provided in each test:
	 *   - literal value
	 *   - undefined
	 *   - promise from various constructors, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.catches] - true if handler fires rejected promise
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoReceivingValue: function(fn, options) {
		var u = this;
		options = options || {};

		describe('returns instance of patched Promise constructor when attached to promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				describe('when value is', function() {
					u.describeValues(function(makeValue) {
						u.testIsPromise(function(cb) {
							var p = makePromise();

							attach(function() {
								var value = makeValue();
								var newP = fn(p, value);
								if (options.catches) {
									if (u.getRejectStatus(p) && u.getRejectStatus(value)) u.setRejectStatus(newP);
								} else {
									if (u.getRejectStatus(p) || u.getRejectStatus(value)) u.setRejectStatus(newP);
								}
								cb(newP);
							}, p);
						});
					});
				});
			});
		});
	},

	/**
	 * Run set of tests on a prototype method that takes a handler to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * `fn` is called with a `promise` and a `handler` function.
	 * `fn` should call method under test on `promise` with `handler` callback attached
	 * and return resulting promise.
	 * e.g. `return promise.then(handler)`
	 *
	 * A different `handler` is provided in each test.
	 * Handlers returns a literal value, throw, or return or a promise that resolves/rejects.
	 * Promises returned from handlers are instances of various different Promise constructors.
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} options.continues - true if handler fires on resolved promise
	 * @param {boolean} options.catches - true if handler fires rejected promise
	 * @param {boolean} options.passThrough - true if method passes through errors even if handler fires
	 * @param {boolean} options.noUndefined - true if method does not accept undefined handler
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoReceivingHandler: function(fn, options) {
		var u = this;
		describe('returns instance of patched Promise constructor when called on promise', function() {
			u.describeMainPromisesAttach(function(makePromise, attach) {
				describe('and handler', function() {
					// Test undefined handler
					if (!options.noUndefined) {
						u.test('is undefined', function(t) {
							var p = makePromise();

							attach(function() {
								var newP = fn(p, undefined);
								u.inheritRejectStatus(newP, p);

								t.error(u.checkIsPromise(newP));
								t.done(newP);
							}, p);
						});
					}

					// Test handlers
					var handlerShouldBeCalled = u.getRejectStatus(makePromise) ? options.catches : options.continues;
					if (handlerShouldBeCalled) {
						// Handler should fire on this promise - test all handlers
						u.describeHandlers(function(handler) {
							u.testIsPromiseFromProtoMethod(fn, makePromise, attach, handler, 1, options.passThrough);
						});
					} else {
						// Handler should not fire on this promise
						describe('is ignored', function() {
							u.testIsPromiseFromProtoMethod(fn, makePromise, attach, undefined, 0, true);
						});
					}
				});
			});
		});
	},

	/**
	 * Run set of tests on a prototype method that chains onto promise of an array
	 * and receives no value or handler to ensure always returns a promise
	 * inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `promise`.
	 * `fn` should call the method being tested on `promise`, and return resulting promise.
	 * e.g. `return promise.all()`
	 *
	 * A different `promise` is provided in each test:
	 *   - resolved sync or async with
	 *     - undefined
	 *     - array
	 *   - rejected sync or async with error
	 *
	 * Arrays can have members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @param {boolean} [options.object=false] - true if method takes object not array i.e. `.props()`
	 * @param {boolean} [options.aggregateError] - true if method produces `AggregateError`s on rejection
	 * @param {boolean} [options.noReject] - true if method never produces a rejected promise i.e. `Promise.settle()`
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoOnArrayReceivingNothing: function(fn, options) {
		var u = this;

		describe('returns instance of patched Promise constructor when chained on promise', function() {
			u.describeMainPromisesArrayAttach(function(makePromise, attach) {
				u.testIsPromise(function(cb) {
					var p = makePromise();

					// `_array` property needed for `.settle()` test
					p._array = makePromise._array;

					attach(function() {
						var newP = fn(p);
						if (!options.noReject) u.inheritRejectStatus(newP, p);
						cb(newP);
					}, p);
				}, {aggregateError: options.aggregateError});
			}, options);
		});
	},

	/**
	 * Run set of tests on a prototype method that chains on promise of an array and receives a handler
	 * to ensure always returns a promise inherited from correct Promise constructor.
	 *
	 * Test function `fn` is called with a `promise` and a `handler`.
	 * `fn` should call the method being tested on `promise`, attaching `handler` and return resulting promise.
	 * e.g. `return promise.map(handler)`
	 *
	 * A different `promise` is provided in each test:
	 *   - resolved sync or async with
	 *     - undefined
	 *     - array
	 *   - rejected sync or async with error
	 *
	 * Arrays can have members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * Handlers return a resolved/rejected sync/asyc promise, literal value, undefined, or throw.
	 *
	 * @param {Function} fn - Test function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.continues=false] - true if handler fires on resolved promise
	 * @param {boolean} [options.catches=false] - true if handler fires rejected promise
	 * @param {boolean} [options.noUndefinedValue=false] - true if method does not accept undefined value
	 * @param {boolean} [options.noUndefinedHandler=false] - true if method does not accept undefined handler
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`.spread()`)
	 * @returns {undefined}
	 */
	testSetReturnsPromiseProtoOnArrayReceivingHandler: function(fn, options) {
		var u = this;
		describe('returns instance of patched Promise constructor when chained on promise', function() {
			u.describeMainPromisesArrayAttach(function(makePromise, attach) {
				describe('and handler', function() {
					// Test undefined handler
					if (!options.noUndefinedHandler) {
						u.test('is undefined', function(t) {
							var p = makePromise();

							attach(function() {
								var newP = fn(p, undefined);
								u.inheritRejectStatus(newP, p);

								t.error(u.checkIsPromise(newP));
								t.done(newP);
							}, p);
						});
					}

					// Test handlers
					var handlerShouldBeCalled = u.getRejectStatus(makePromise) ? options.catches : options.continues;
					if (handlerShouldBeCalled) {
						// Handler should fire on this promise - test all handlers
						u.describeHandlers(function(handler) {
							var expectedCalls = u.helperProtoArrayNumHandlerCalls(makePromise, attach, handler, options);
							u.testIsPromiseFromProtoMethod(fn, makePromise, attach, handler, expectedCalls, false);
						});
					} else {
						// Handler should not fire on this promise
						describe('is ignored', function() {
							u.testIsPromiseFromProtoMethod(fn, makePromise, attach, undefined, 0, true);
						});
					}
				});
			}, {noUndefined: options.noUndefinedValue});
		});
	}
};
