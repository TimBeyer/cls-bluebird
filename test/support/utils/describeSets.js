/*
 * cls-bluebird tests
 * Utilities
 * Describe sets.
 * Mixin to Utils prototype.
 */

/* global describe */

// Modules
var _ = require('lodash');

// Exports
module.exports = {
	/**
	 * Create `describe` test groups for values that can be consumed by methods that take a value.
	 * e.g. `Promise.resolve(value)`.
	 * Calls `testFn` with `makeValue` function that creates different values when called.
	 *
	 * `makeValue` returns:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @returns {undefined}
	 */
	describeValues: function(testFn, options) {
		var u = this;
		options = options || {};

		describe('literal value', function() {
			testFn(u.valueCreator());
		});

		if (!options.noUndefined) {
			describe('undefined', function() {
				testFn(u.makeUndefined);
			});
		}

		u.describeAllPromises(testFn);
	},

	/**
	 * Create `describe` test groups for handler functions that can be consumed by methods which take a callback.
	 * e.g. `Promise.try(handler)`, `promise.then(handler)`.
	 * Calls `testFn` with handler functions.
	 *
	 * Handlers return:
	 *   - literal value
	 *   - undefined
	 *   - thrown error
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @returns {undefined}
	 */
	describeHandlers: function(testFn) {
		var u = this;

		describe('returns', function() {
			u.describeValues(function(makeValue) {
				// Wrap `makeValue` so it takes no arguments as this will be used as a handler.
				// (Handlers receive arbitrary input which should be ignored)
				var makeValueWrapped = function() {
					return makeValue();
				};
				u.inheritRejectStatus(makeValueWrapped, makeValue);

				// `_constructor` and `_async` properties needed for `Promise.map()` test
				makeValueWrapped._constructor = makeValue._constructor;
				makeValueWrapped._async = makeValue._async;

				testFn(makeValueWrapped);
			});
		});

		describe('throws error', function() {
			testFn(u.throwHandler());
		});
	},

	/**
	 * Create `describe` test groups for array values that can be consumed by methods that take an array value.
	 * e.g. `Promise.all(array)`.
	 * Calls `testFn` with `makeArray` function that creates different arrays when called.
	 *
	 * `makeArray` returns:
	 *   - undefined
	 *   - array with members:
	 *     - literal value
	 *     - undefined
	 *     - promises of different types, resolved or rejected, sync or async
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @param {boolean} [options.object=false] - true if method takes object not array i.e. `Promise.props()`
	 * @param {boolean} [options.suppressRejections=false] - true to suppress unhandled rejections
	 * @returns {undefined}
	 */
	describeArrays: function(testFn, options) {
		var u = this;
		options = options || {};

		if (!options.noUndefined) {
			describe('undefined', function() {
				testFn(u.makeUndefined);
			});
		}

		describe('array containing', function() {
			u.describeValues(function(makeValue) {
				var makeArray = function() {
					var value = [makeValue(), makeValue(), makeValue()];

					if (options.suppressRejections && u.getRejectStatus(makeValue)) {
						value.forEach(function(p) {
							u.suppressUnhandledRejections(p);
						});
					}

					if (options.object) value = {a: value[0], b: value[1], c: value[2]};

					u.inheritRejectStatus(value, makeValue);
					return value;
				};
				u.inheritRejectStatus(makeArray, makeValue);

				// `_async` property needed for `Promise.map()`/`.map()` test
				makeArray._async = makeValue._async;

				testFn(makeArray);
			});
		});
	},

	/**
	 * Create `describe` test groups for promises from main constructor of arrays that can be chained onto
	 * by prototype methods that expect promise to resolve to an array value.
	 * e.g. `promise.all()`.
	 * Calls `testFn` with `makePromise` function that creates promises of different arrays when called.
	 *
	 * `makePromise` returns promises:
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
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @param {boolean} [options.object=false] - true if method takes object not array i.e. `Promise.props()`
	 * @returns {undefined}
	 */
	describeMainPromisesArray: function(testFn, options) {
		var u = this;
		u.describeMainPromises(function(makeValue) {
			if (u.getRejectStatus(makeValue)) {
				describe('with error', function() {
					testFn(makeValue);
				});
				return;
			}

			describe('with', function() {
				u.describeArrays(function(makeArray) {
					var makePromise = function() {
						return makeValue(makeArray);
					};
					u.inheritRejectStatus(makePromise, makeArray);

					// `_async` and `_asyncArray` properties needed for `Promise.map()`/`.map()` test
					makePromise._async = makeValue._async;
					makePromise._asyncArray = makeArray._async;

					// `_array` property needed for `.settle()` test
					makePromise._array = true;

					testFn(makePromise);
				}, _.defaults({suppressRejections: true}, options));
			});
		});
	},

	/**
	 * Create `describe` test groups for promises from main constructor of arrays that can be chained onto
	 * by prototype methods that expect promise to resolve to an array value.
	 * e.g. `promise.all()`.
	 * Calls `testFn` with `makePromise` function that creates promises of different arrays when called
	 * and function `attach` that schedules a function to run immediately or in next tick.
	 *
	 * `makePromise` returns promises:
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
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @param {boolean} [options.object=false] - true if method takes object not array i.e. `Promise.props()`
	 * @returns {undefined}
	 */
	describeMainPromisesArrayAttach: function(testFn, options) {
		var u = this;
		u.describeMainPromisesArray(function(makePromise) {
			describe('and method attached', function() {
				u.describeAttach(function(attach) {
					testFn(makePromise, attach);
				});
			});
		}, options);
	},

	/**
	 * Create `describe` test groups for array values that can be consumed by methods that take an array value.
	 * e.g. `Promise.all(array)`.
	 * Calls `testFn` with `makePromise` function that creates different promises of arrays when called.
	 *
	 * `makePromise` returns:
	 *   - undefined
	 *   - array
	 *   - promises of different types
	 *     - resolved sync or async with
	 *       - undefined
	 *       - array
	 *     - rejected sync or async with error
	 *
	 * Arrays can have members:
	 *   - literal value
	 *   - undefined
	 *   - promises of different types, resolved or rejected, sync or async
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with `makePromise` function.
	 * @param {Object} [options] - Options object
	 * @param {boolean} [options.noUndefined=false] - true if method does not accept undefined value
	 * @param {boolean} [options.object=false] - true if method takes object not array i.e. `Promise.props()`
	 * @returns {undefined}
	 */
	describeArrayOrPromiseOfArrays: function(testFn, options) {
		var u = this;
		options = options || {};

		u.describeValues(function(makeValue) {
			if (makeValue === u.makeUndefined || u.getRejectStatus(makeValue)) return testFn(makeValue);

			u.describeArrays(function(makeArray) {
				var makePromise = function() {
					return makeValue(makeArray);
				};
				u.inheritRejectStatus(makePromise, makeArray);

				// `_asyncArray` property needed for `Promise.map()`/`.map()` test
				makePromise._asyncArray = makeArray._async;

				// `_array` property needed for `Promise.settle()` test
				makePromise._array = true;

				makePromise._async = makeValue._async; // TODO Remove this once issue with unhandled rejections is solved

				testFn(makePromise);
			}, _.defaults({suppressRejections: true}, options));
		}, options);
	},

	/**
	 * Create `describe` test groups for promise of different types resolved/rejected sync/async.
	 * Calls `testFn` with a function `makePromise` to create a promise.
	 *
	 * Cases cover:
	 *   - promises made from each alterative Promise constructors
	 *   - promises resolved or rejected
	 *   - promises resolved/rejected sync or async
	 *
	 * @param {Function} testFn - Function to call for each `describe`.
	 * @returns {undefined}
	 */
	describeAllPromises: function(testFn) {
		var u = this;
		u.describePromiseConstructors(function(Promise) {
			u.describePromisesFromCtor(testFn, Promise);
		});
	},

	/**
	 * Create `describe` test groups for main promise resolved/rejected sync/async.
	 * Calls `testFn` with a function `makePromise` to create a promise.
	 *
	 * Cases cover:
	 *   - promises resolved or rejected
	 *   - promises resolved/rejected sync or async
	 *
	 * @param {Function} testFn - Function to call for each `describe`.
	 * @returns {undefined}
	 */
	describeMainPromises: function(testFn) {
		var u = this;
		u.describePromisesFromCtor(testFn, u.Promise);
	},

	/**
	 * Create `describe` test groups for promise resolved/rejected sync/async and handler attached sync/async.
	 * Calls `testFn` with a function `makePromise` to create a promise
	 * and function `attach` that schedules a function to run immediately or in next tick.
	 *
	 * @param {Function} testFn - Function to call for each `describe`.
	 * @returns {undefined}
	 */
	describeMainPromisesAttach: function(testFn) {
		var u = this;
		u.describeMainPromises(function(makePromise) {
			describe('and method attached', function() {
				u.describeAttach(function(attach) {
					testFn(makePromise, attach);
				});
			});
		});
	},

	/**
	 * Create `describe` test groups for each alternative Promise constructor.
	 * @param {Function} testFn - Function to call for each `describe`. Called with `Promise` constructor.
	 * @returns {undefined}
	 */
	describePromiseConstructors: function(testFn) {
		var u = this;

		u.altPromises.forEach(function(altPromiseParams) {
			var Promise = altPromiseParams.Promise;

			var runThis = (Promise ? describe : describe.skip);
			runThis('promise (' + altPromiseParams.name + ')', function() {
				testFn(Promise);
			});
		});
	},

	/**
	 * Create `describe` test groups for promise resolved/rejected sync/async.
	 * Calls `testFn` with:
	 *   - a function `makePromise` to create a promise
	 *   - a function `attach` that schedules a function to run immediately or in next tick
	 *
	 * @param {Function} testFn - Function to call for each `describe`. Called with function to create a promise.
	 * @param {Function} Promise - Promise constructor to create promises with
	 * @returns {undefined}
	 */
	describePromisesFromCtor: function(testFn, Promise) {
		var u = this;

		describe('resolved', function() {
			describe('sync', function() {
				testFn(u.resolveSyncHandler(Promise));
			});

			describe('async', function() {
				testFn(u.resolveAsyncHandler(Promise));
			});
		});

		describe('rejected', function() {
			describe('sync', function() {
				testFn(u.rejectSyncHandler(Promise));
			});

			describe('async', function() {
				testFn(u.rejectAsyncHandler(Promise));
			});
		});
	},

	/**
	 * Create `describe` test groups for attaching a handler to a promise sync/async.
	 * Calls `testFn` with an `attach` function that schedules a function to run immediately
	 * or once promise attaching to resolves.
	 * If awaiting resolution of promise attaching to, and promise is going to reject,
	 * it suppresses unhandled rejections on the promise.
	 *
	 * @param {Function} testFn - Function to call for each `describe`
	 * @returns {undefined}
	 */
	describeAttach: function(testFn) {
		var u = this;

		describe('sync', function() {
			testFn(function(fn) {
				fn();
			});
		});

		describe('async', function() {
			var attach = function(fn, p) {
				// If promise chaining onto is rejecting, suppress unhandled rejections
				if (u.getRejectStatus(p)) u.suppressUnhandledRejections(p);

				// Await promise's resolution before calling back
				u.awaitPromise(p, fn);
			};

			// `_async` property needed for `.map()` test
			attach._async = true;

			testFn(attach);
		});
	},

	/**
	 * Create `describe` test groups for executing sync/async.
	 * Calls `testFn` with an `attach` function that schedules a function to run immediately or in next tick.
	 *
	 * @param {Function} testFn - Function to call for each `describe`
	 * @returns {undefined}
	 */
	describeAttachSimple: function(testFn) {
		describe('sync', function() {
			testFn(function(fn) {
				fn();
			});
		});

		describe('async', function() {
			testFn(function(fn) {
				setImmediate(fn);
			});
		});
	}
};
