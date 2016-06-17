'use strict';

var shimmer = require('shimmer');

var Bluebird;
try {
    Bluebird = require('bluebird');
} catch (err) {}

module.exports = function patchBluebird(ns, Promise) {
    if (typeof ns.bind !== 'function') {
        throw new TypeError('must include namespace to patch bluebird against');
    }

    if (!Promise) {
        Promise = Bluebird;
        if (!Promise) throw new Error('could not require bluebird');
    } else if (!isBluebirdConstructor(Promise)) {
        throw new TypeError('promise implementation provided must be bluebird');
    }

    var proto = Promise.prototype;
    shimmer.wrap(proto, '_addCallbacks', function(_addCallbacks) {
        return function ns_addCallbacks(fulfill, reject, progress, promise, receiver, domain) {
            if (typeof fulfill === 'function') fulfill = ns.bind(fulfill);
            if (typeof reject === 'function') reject = ns.bind(reject);
            if (typeof progress === 'function') progress = ns.bind(progress);

            return _addCallbacks.call(this, fulfill, reject, progress, promise, receiver, domain);
        };
    });
};

function isBluebirdConstructor(Promise) {
    return isBluebirdPromise(new Promise(function() {}));
}

function isBluebirdPromise(promise) {
    return Object.prototype.hasOwnProperty.call(promise, '_promise0');
}
