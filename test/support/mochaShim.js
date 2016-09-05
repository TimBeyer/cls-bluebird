/*
 * cls-bluebird tests
 * Shim mocha to treat `describe` with single `it` inside as an `it`.
 * i.e. `describe('foo', function() { it('bar', function() {}); })`
 * is treated as `it('foo bar', function() {})`.
 */

/* global describe, it, before, beforeEach, after, afterEach */

// Modules
var _ = require('lodash');

// Capture mocha's original methods
var originals = {
	describe: describe,
	it: it,
	before: before,
	beforeEach: beforeEach,
	after: after,
	afterEach: afterEach
};

// Exports

module.exports = function() {
	// Exit if methods already shimmed
	if (describe.__shimmed) return;

	// Init call tracker var
	var calls = null;

	// Replace mocha methods
	describe = createReplacement(describe, function(name, fn, noCollapse, methodName) { // jshint ignore:line
		noCollapse = !!noCollapse;
		if (!calls) return describeRun(name, fn, noCollapse, methodName);
		calls.push({type: 'describe', name: name, fn: fn, noCollapse: noCollapse, methodName: methodName});
	});

	describe.__shimmed = true;

	it = createReplacement(it, function(name, fn, methodName) { // jshint ignore:line
		if (typeof name === 'function') {
			fn = name;
			name = '';
		}

		if (!calls) return itMethod(methodName)(name, fn);
		calls.push({type: 'it', name: name, fn: fn, methodName: methodName});
	});

	before = createReplacement(before, function(fn, methodName) { // jshint ignore:line
		if (!calls) return method('before', methodName)(fn);
		calls.push({type: 'before', fn: fn, methodName: methodName});
	});

	beforeEach = createReplacement(beforeEach, function(fn, methodName) { // jshint ignore:line
		if (!calls) return method('beforeEach', methodName)(fn);
		calls.push({type: 'beforeEach', fn: fn, methodName: methodName});
	});

	after = createReplacement(after, function(fn, methodName) { // jshint ignore:line
		if (!calls) return method('after', methodName)(fn);
		calls.push({type: 'after', fn: fn, methodName: methodName});
	});

	beforeEach = createReplacement(afterEach, function(fn, methodName) { // jshint ignore:line
		if (!calls) return method('afterEach', methodName)(fn);
		calls.push({type: 'afterEach', fn: fn, methodName: methodName});
	});

	// Function to execute a `describe` statement
	function describeRun(name, fn, noCollapse, methodName) {
		// Run function and capture calls
		calls = [];
		fn();
		var thisCalls = calls;
		calls = null;

		// Only a single `it` in the `describe` - run as single `it` unless `noCollapse` set
		if (thisCalls.length === 1 && !noCollapse) {
			var call = thisCalls[0];
			if (call.type === 'it' && (!methodName || !call.methodName || call.methodName === methodName)) {
				if (!methodName) methodName = call.methodName;
				if (call.name) name += ' ' + call.name;

				itMethod(methodName)(name, call.fn);
				return;
			}
		}

		// Multiple calls in the `describe` - run as usual
		describeMethod(methodName)(name, function() {
			thisCalls.forEach(function(call) {
				if (call.type === 'describe') return describeRun(call.name, call.fn, call.noCollapse, call.methodName);
				method(call.type, call.methodName)(call.name, call.fn);
			});
		});
	}
};

function createReplacement(original, executor) {
	var replacement = function() {
		executor.apply(this, arguments);
	};

	_.forIn(original, function(method, methodName) {
		if (typeof method !== 'function') return;
		replacement[methodName] = function() {
			var args = Array.prototype.slice.call(arguments);
			args[executor.length - 1] = methodName;
			executor.apply(this, args);
		};
	});

	return replacement;
}

function describeMethod(methodName) {
	return method('describe', methodName);
}

function itMethod(methodName) {
	return method('it', methodName);
}

function method(name, methodName) {
	var fn = originals[name];
	return methodName ? fn[methodName] : fn;
}
