'use strict';

var shimmer = require('shimmer');

module.exports = function patchBluebird(ns) {
    if (typeof ns.bind !== 'function') {
        throw new TypeError('must include namespace to patch bluebird against');
    }

    var Promise = require('bluebird');
    var async = require('bluebird/js/main/async');
    var proto = Promise && Promise.prototype;

    shimmer.wrap(proto, '_addCallbacks', function(_addCallbacks) {
        return function ns_addCallbacks(fulfill, reject, progress, promise, receiver) {
            if (typeof fulfill === 'function') fulfill = ns.bind(fulfill);
            if (typeof reject === 'function') reject = ns.bind(reject);
            if (typeof progress === 'function') progress = ns.bind(progress);

            return _addCallbacks.call(this, fulfill, reject, progress, promise, receiver);
        };
    });

    shimmer.wrap(async, 'invokeLater', function(invokeLater) {
        return function ns_invokeLater(fn, receiver, arg) {
            return invokeLater.call(this, (typeof fn === 'function') ? ns.bind(fn) : fn, receiver, arg);
        };
    });

    shimmer.wrap(async, 'invoke', function(invoke) {
        return function ns_invoke(fn, receiver, arg) {
            return invoke.call(this, (typeof fn === 'function') ? ns.bind(fn) : fn, receiver, arg);
        };
    });
};
