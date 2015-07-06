'use strict';

var shimmer = require('shimmer');

module.exports = function patchBluebird(ns) {
    if (typeof ns.bind !== 'function') {
        throw new TypeError("must include namespace to patch bluebird against");
    }

    var Promise = require('bluebird');
    var proto = Promise && Promise.prototype;
    shimmer.wrap(proto, '_addCallbacks', function(_addCallbacks) {
        return function ns_addCallbacks(fulfill, reject, progress, promise, receiver, domain) {
            if (typeof fulfill === 'function') fulfill = ns.bind(fulfill);
            if (typeof reject === 'function') reject = ns.bind(reject);
            if (typeof progress === 'function') progress = ns.bind(progress);

            return _addCallbacks.call(this, fulfill, reject, progress, promise, receiver, domain);
        };
    });
};
