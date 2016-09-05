/*
 * cls-bluebird tests
 * Test all methods are patched
 */

/* global describe, it */

// Modules
var expect = require('chai').expect,
	_ = require('lodash');

// Imports
var runTests = require('../support');

// Run tests

runTests('Patch', function(u, Promise) {
	describe('patches', function() {
		describe('static method', function() {
			var ignore = [
				'onPossiblyUnhandledRejection',
				'onUnhandledRejectionHandled',
				'longStackTraces',
				'hasLongStackTraces',
				'config',
				'getNewLibraryCopy',
				'is',
				'fromCallback',
				'fromNode',
				'promisify',
				'promisifyAll',
				'all',
				'props',
				'any',
				'some',
				'race',
				'resolve',
				'fulfilled',
				'cast',
				'reject',
				'rejected',
				'setScheduler',
				'method',
				'try',
				'attempt',
				'bind',
				'settle',
				'delay',
				'defer',
				'pending'
			];

			checkPatched(Promise, ignore);
		});

		describe('prototype method', function() {
			var ignore = [
				'error',
				'all',
				'props',
				'any',
				'some',
				'race',
				'bind',
				'isFulfilled',
				'isRejected',
				'isPending',
				'isCancelled',
				'isResolved',
				'value',
				'reason',
				'reflect',
				'settle',
				'delay',
				'timeout',
				'get',
				'return',
				'thenReturn',
				'throw',
				'thenThrow',
				'catchReturn',
				'catchThrow',
				'cancel',
				'break',
				'isCancellable',
				'cancellable',
				'uncancellable',
				'suppressUnhandledRejections',
				'toString',
				'toJSON'
			];

			// `.catch()`, `.caught()` + `.each()` are only patched on bluebird v2
			if (u.bluebirdVersion !== 2) ignore.push('catch', 'caught', 'each');

			checkPatched(Promise.prototype, ignore);
		});
	});

	describe('maintains method equality', function() {
		it('static methods', function() {
			checkEqual(Promise, u.UnpatchedPromise);
		});

		it('prototype methods', function() {
			checkEqual(Promise.prototype, u.UnpatchedPromise.prototype);
		});
	});
});

/**
 * Check all object's methods are patched (creating a test case for each).
 * Methods whose names are in `ignore` array are skipped.
 * Methods whose names start with a capital or '_' are skipped.
 *
 * @param {Object} obj - Object that's been patched
 * @param {Array} ignore - Array of method names to skip
 * @returns {undefined}
 */
function checkPatched(obj, ignore) {
	_.forIn(obj, function(method, name) {
		if (name.match(/^[A-Z_]/)) return;
		if (ignore.indexOf(name) !== -1) return;
		if (typeof method !== 'function') return;

		it(name, function() {
			if (!method.__wrapped) throw new Error("'" + name + "' method not patched"); // jshint ignore:line
		});
	});
}

/**
 * Check equality of methods is same before and after patching.
 * @param {Object} obj - Object after patching
 * @param {Object} unpatchedObj - Same object before patching
 * @returns {undefined}
 * @throws {AssertionError} - If patching has changed things
 */
function checkEqual(obj, unpatchedObj) {
	var matchesUnpatched = getEquals(unpatchedObj);
	var matchesPatched = getEquals(obj);

	expect(matchesPatched).to.deep.equal(matchesUnpatched);
}

/**
 * Loop through all object's methods and return array of any which are equal to each other.
 * e.g. `obj.method1 == obj.method2, obj.method3 == obj.method4`
 *   -> [ ['method1', 'method2'], ['method3', 'method4'] ]
 *
 * @param {Object} obj - Object whose methods to check
 * @returns {Array} - Array of matches
 */
function getEquals(obj) {
	var keys = Object.keys(obj).sort();

	var matches = [],
		matched = [];
	keys.forEach(function(key) {
		var method = obj[key];
		if (typeof method !== 'function') return;
		if (matches.indexOf(key) !== -1) return;

		var thisMatches = [];
		keys.forEach(function(otherKey) {
			if (otherKey <= key) return;

			var otherMethod = obj[otherKey];
			if (method === otherMethod) {
				thisMatches.push(otherKey);
				matched.push(otherKey);
			}
		});

		if (thisMatches.length) {
			thisMatches.unshift(key);
			matches.push(thisMatches);
		}
	});

	return matches;
}
