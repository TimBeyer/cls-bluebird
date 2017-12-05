/*
 * cls-bluebird tests
 * Tests for Promise.coroutine() / Promise.spawn()
 * File required by coroutine.test.js + spawn.test.js
 */

/* global describe, it */
// jshint esversion:6

// Export function to run tests

module.exports = function(u, co, type) {
  if (type === 'coroutine') {
    co.addYieldHandler(function(value) {
      if (typeof value === 'number') return Promise.delay(value);
		});
	}

	describe('returns instance of patched Promise constructor when generator', function() {
		describe('returns value', function() {
			u.testIsPromiseFromHandler(function(handler, cb) {
				var fn = co(function*() {
					handler();
					return u.makeValue();
				}); // jshint ignore:line

				var p = fn();
				cb(p);
			});
		});

		describe('throws error', function() {
			u.testIsPromiseFromHandler(function(handler, cb) {
				var fn = co(function*() {
					handler();
					throw u.makeError();
				}); // jshint ignore:line

				var p = fn();
				u.setRejectStatus(p);
				cb(p);
			});
		});

		describe('yields', function() {
			u.describeAllPromises(function(makePromise) {
				u.testIsPromiseFromHandler(function(handler, cb) {
					var fn = co(function*() {
						yield handler();
					});

					var p = fn();
					u.inheritRejectStatus(p, handler);
					cb(p);
				}, makePromise);
			});
		});
	});

	describe('calls', function() {
		describe('generator synchronously', function() {
			u.testSync(function(handler, cb) {
				var fn = co(function*() {
					handler();
				}); // jshint ignore:line

				var p = fn();
				cb(p);
			});
		});

		describe('generator code asynchronously after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testAsync(function(handler, cb) {
					var fn = co(function*() {
						try {
							yield makePromise();
						} catch (err) {}

						handler();
					});

					var p = fn();
					cb(p);
				});
			});
		});

    describe('generator code asynchronously after yielding after use custom yield handler', function() {
      u.describeAllPromises(function(makePromise) {
        u.testAsync(function(handler, cb) {
          var fn = co(function*() {
            try {
              if (type === 'coroutine') {
                yield 500;
              }

              yield makePromise();
            } catch (err) {}

            handler();
          });

          var p = fn();
          cb(p);
        });
      });
    });

		describe('generator code in finally block asynchronously after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testAsync(function(handler, cb) {
					var fn = co(function*() {
						try {
							yield makePromise();
						} finally {
							handler();
						}
					});

					var p = fn();
					u.inheritRejectStatus(p, makePromise);
					cb(p);
				});
			});
		});
	});

	describe('generator methods bound to CLS context', function() {
		// Generators in node v4.x lack the `return` method, so only 2 methods bound
		// on node v4 versus 3 methods on mode v6.
		var expectedBindings = (u.nodeVersion === '4' ? 2 : 3);

		u.testBound(function(handler, fn, cb) {
			var p = fn(handler);
			cb(p);
		}, function() {
			// preFn to create coroutine
			return co(function*(handler) {
				handler();
			}); // jshint ignore:line
		}, undefined, {bindIndirect: true, expectedBindings: expectedBindings});
	});

	describe('patch leaves Promise.prototype.lastly patch in place', function() {
		it(function() {
			var fn = co(function*() {}); // jshint ignore:line
			var p = fn();

			if (!u.Promise.prototype.lastly.__wrapped) throw new Error('Patch has interfered with `.lastly` patch');

			return p;
		});
	});

	// TODO Find better way to do this with `handler` being passed into preFn
	describe('generator code runs in context', function() {
		describe('prior to yield', function() {
			u.testRunContext(function(handler, fn, cb) {
				var p = fn(handler);
				cb(p);
			}, function() {
				// preFn to create coroutine
				return co(function*(handler) {
					handler();
				}); // jshint ignore:line
			});
		});

		describe('after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testRunContext(function(handler, fn, cb) {
					var p = fn(handler);
					cb(p);
				}, function() {
					// preFn to create coroutine
					return co(function*(handler) {
						try {
							yield makePromise();
						} catch (err) {}

						handler();
					});
				});
			});
		});

    describe('after yielding with cutsom yield handler', function() {
      u.describeAllPromises(function(makePromise) {
        u.testRunContext(function(handler, fn, cb) {
          var p = fn(handler);
          cb(p);
        }, function() {
          // preFn to create coroutine
          return co(function*(handler) {
            try {
              if (type === 'coroutine') {
                yield 500;
              }

              yield makePromise();
            } catch (err) {}

            handler();
          });
        });
      });
    });

    describe('in finally block after yielding', function() {
			u.describeAllPromises(function(makePromise) {
				u.testRunContext(function(handler, fn, cb) {
					var p = fn(handler);
					u.inheritRejectStatus(p, makePromise);
					cb(p);
				}, function() {
					// preFn to create coroutine
					return co(function*(handler) {
						try {
							yield makePromise();
						} finally {
							handler();
						}
					});
				});
			});
		});
	});
};
