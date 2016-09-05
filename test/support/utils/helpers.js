/*
 * cls-bluebird tests
 * Utilities
 * Helper functions.
 * Mixin to Utils prototype.
 */

// Exports

module.exports = {
	/**
	 * Calculate number of times handler callback should be called for a static method
	 * that received array and handler.
	 *
	 * Worked out based on rejection status of value & handler, and options describing the method.
	 * It works around various kinks in bluebird's behavior.
	 *
	 * @param {Function} makeValue - Function to call to make the value method acts upon
	 * @param {Function} [handler] - Handler function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (e.g. `Promise.join()`)
	 * @returns {number} - Number of times handler should be run.
	 */
	helperStaticArrayNumHandlerCalls: function(makeValue, handler, options) {
		var u = this;

		if (!handler) handler = function() {};

		// TODO Raise issue on bluebird about inconsistent behavior between node v0.10 and v0.12+
		var oneCall = handler._throws || options.oneCallback || (
			u.getRejectStatus(handler)
			&& (
				options.series
				|| (
					!handler._async
					&& (
						handler._constructor === u.Promise
						|| (u.nodeVersion === '0.10' && makeValue._asyncArray)
					)
				)
			)
		);

		return oneCall ? 1 : 3;
	},

	/**
	 * Calculate number of times handler callback should be called for a prototype method
	 * that chains onto promise of an array.
	 *
	 * Worked out based on rejection status of value & handler, sync/async of attach function,
	 * and options describing the method.
	 * It works around various kinks in bluebird's behavior.
	 *
	 * @param {Function} makePromise - Function to call to make the promise method chain on to
	 * @param {Function} attach - Function to either execute callback now or in next tick
	 * @param {Function} [handler] - Handler function
	 * @param {Object} options - Options object
	 * @param {boolean} [options.series=false] - true if method iterates through array in series
	 * @param {boolean} [options.oneCallback=false] - true if callback should only be called once (`.spread()`)
	 * @returns {number} - Number of times handler should be run.
	 */
	helperProtoArrayNumHandlerCalls: function(makePromise, attach, handler, options) {
		var u = this;

		if (!handler) handler = function() {};

		// TODO Raise issue on bluebird about inconsistent behavior between node v0.10 and v0.12+
		var oneCall = handler._throws || options.oneCallback || (
			u.getRejectStatus(handler)
			&& (
				options.series
				|| (
					!handler._async
					&& (
						handler._constructor === u.Promise
						|| (
							u.nodeVersion === '0.10'
							&& makePromise._asyncArray
							&& (makePromise._async || !attach._async)
						)
					)
				)
			)
		);

		return oneCall ? 1 : 3;
	},

	/**
	 * Suppress unhandled rejections on a promise in a static method that receives a promise of an array.
	 * Due to bug in bluebird: https://github.com/petkaantonov/bluebird/issues/1158
	 *
	 * This is a workaround for bug in bluebird where a promise from another constructor
	 * which is rejected synchronously results in an unhandled rejection on `Promise.map()`.
	 *
	 * @param {*} value - Value being passed to method
	 * @param {Function} makeValue - Function that creates values
	 * @returns {undefined}
	 *
	 * TODO Remove this when bug is fixed
	 * TODO Check this is required for methods other than `Promise.map()`
	 */
	helperSuppressUnhandledRejectionsStaticArray: function(value, makeValue) {
		var u = this;
		var suppress = u.isPromise(value)
			&& value.constructor !== u.Promise
			&& u.getRejectStatus(value)
			&& !makeValue._array
			&& !makeValue._async;
		if (suppress) u.suppressUnhandledRejections(value);
	},

	/**
	 * Wrap a handler function.
	 * `wrapper` is executed first, then the original `handler` (if provided).
	 * Wrapped handler inherits the original handler's reject status.
	 *
	 * @param {Function} [handler] - Handler function to be wrapped
	 * @param {Function} wrapper - Function to run inside the wrapped handler
	 * @returns {Function} - Wrapped handler
	 */
	wrapHandler: function(handler, wrapper) {
		var u = this;

		var handlerWrapped = function() {
			wrapper();
			if (handler) return handler.apply(this, arguments);
		};
		u.inheritRejectStatus(handlerWrapped, handler);

		return handlerWrapped;
	}
};
