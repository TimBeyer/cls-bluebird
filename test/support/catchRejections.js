/*
 * cls-bluebird tests
 * Add handler for unhandled rejections.
 * Registers handler for unhanded rejections and adds mocha `after` block to throw if any encountered.
 */

/* global after */

// Exports

var unhandledRejectionHandlerApplied = false;

module.exports = function() {
	// Exit if handler already registered
	if (unhandledRejectionHandlerApplied) return;

	// Add handler
	var uncaughtErrors = [],
		uncaughtPromises = [],
		errorId = 1;

	process.on('unhandledRejection', function(err, promise) {
		console.log('Uncaught rejection (ID ' + errorId + '): ' + (err instanceof Error ? err.stack : err));
		err.__id = errorId;
		errorId++;

		uncaughtErrors.push(err);
		uncaughtPromises.push(promise);
	});

	process.on('rejectionHandled', function(promise) {
		var index = uncaughtPromises.indexOf(promise);
		if (index !== -1) {
			var err = uncaughtErrors[index];
			console.log('Handled rejection ID ' + err.__id);
		}
	});

	after(function() {
		if (uncaughtErrors.length) throw new Error('Uncaught rejections (' + uncaughtErrors.length + ')');
	});

	unhandledRejectionHandlerApplied = true;
};
