# cls-bluebird tests

This document written by [@overlookmotel](https://github.com/overlookmotel) 5th Sept 2016.

## How cls-bluebird works

`cls-bluebird` adds support for CLS to Bluebird by patching all public methods which take a callback which is executed asynchronously. The patches bind the callback to the current CLS context i.e. the context *at the time when the method is executed*.

e.g. `promise.then(function callback() { ... })` sets the CLS context when `callback` is run to the context when the `.then()` method was executed.

## Introduction

The tests aim to be as comprehensive as possible, and cover all possible combinations of input promises and output from callbacks.

CLS is often used for mission-critical functions (e.g. carrying user authentication details across async boundaries) so it's important it be completely reliable in it's operation.

This set of tests is large and complex. The author's aim has been to ensure:

1. cls-bluebird is reliable and trustworthy
2. all edge cases are covered by tests
3. future changes to Bluebird which would cause cls-bluebird to fail are caught immediately

## What the tests cover

The tests cover 5 areas:

### 1. All methods return a promise which is an instance of the patched Promise constructor.

i.e. All promise-returning methods return a promise which is itself patched.

This is covered by tests for all Bluebird methods which return a promise, both static and prototype, including those which do not take a callback e.g. `Promise.all()`

### 2. Methods predictably call the callback sync or async

Any methods which call callback async need to be patched. These tests cover all methods which take a callback, and ensure that the author's assumptions about which methods call the callback async (and hence need patching) are correct.

### 3. All callbacks which will be called async are bound to CLS namespace

These are sort of "unit tests", ensuring that the patches are patching everything they should, and binding callbacks to the correct CLS context.

They use a spy on `ns.bind()`, ensuring it's called as it should be.

These tests also ensure that there's no excessive/unnecessary binding from a patched method calling another patched method internally within bluebird.

### 4. All callbacks are called in same CLS context as the context when were attached

These tests test that callbacks are called in the correct CLS context. They are more like "integration tests".

They cover all methods that take a callback, whether it's called sync or async.

These tests call the method 3 times in parallel, in order to rule out accidental success due to there being only one "thread" in operation.

### 5. All methods are patched if they should be

All methods of `Bluebird` and `Bluebird.prototype` are checked that they're patched, unless they appear on the list of methods known not to need patching.

These tests will fail if new methods are added to Bluebird in a later version, and flag up that cls-bluebird needs changes to cover the new methods.

## Versions of Bluebird covered

The tests test against both latest v2.x and v3.x versions of Bluebird.

## Combinations covered

The tests aim to cover every possible combination of promises and callbacks.

For each prototype method, there are tests for the method being attached to a promise that:

* resolves synchronously
* resolves asynchronously
* rejects synchronously
* rejects asynchronously

Tests cover the method being attached synchronously (i.e. just after creation of the promise) or in next tick/when promise has settled.

For all methods taking a callback, tests cover the callback:

* returning a literal value
* throwing an error
* returning a promise which resolves sync
* returning a promise which resolves async
* returning a promise which rejects sync
* returning a promise which rejects async

Where a callback can return a promise, the tests cover the promise returned being from:

* the patched Bluebird Promise constructor
* the unpatched Bluebird Promise constructor
* another version of Bluebird (patched)
* another version of Bluebird (unpatched)
* native JS Promise

For methods that consume/return arrays, arrays containing either literal values or promises of all the above types are tested against.

The tests aim to cover all of the above in all possible combinations. This results in a very large number of tests (approximately 50,000 for each version of Bluebird).

## Test files structure

The tests use [mocha](https://www.npmjs.com/package/mocha) and [chai](https://www.npmjs.com/package/chai).

### Actual tests

`test/methods` folder contains tests for each Bluebird method. They are categorised into folders as per the Bluebird docs.

`test/init` folder contains tests covering `cls-bluebird`'s API and tests that all methods are patched.

### Support files

#### `runTests`

Each test file requires the `runTests` function from `test/support/index.js`.

`runTests` is analogous to `mocha`'s `describe` method. It passes back to the test function:

* `Promise` - the patched version of Bluebird to be tested against
* `utils` - an object containing utility functions (see below)

#### Other support files

* `ns.js` creates a CLS namespace and patches the `.bind()` method for purpose of tracking when functions are bound to a CLS context
* `catchRejections.js` adds global unhandled rejection handlers
* `mochaShim.js` shims mocha to collapse unnecessarily deep nests of `describe`/`it`s

#### Utils

The body of the code of the tests are in the `test/support/utils` folder.

`test/support/utils/index.js` defines a `Utils` class with a prototype containing many useful functions which represent patterns used repeatedly throughout the tests. All other files in the `utils` folder are mixed in to the `Utils` prototype.

`runTests` creates an instance of the `Utils` class which it passes to the test functions in `test/methods`. Through the test files, the utils object is referred to as `u`.

`u` also contains:

* `u.Promise` - the patched Promise constructor being tested
* `u.altPromises` - array of other Promise constructors which can be used to create promises to be returned from callbacks
* `u.ns` - the active CLS namespace
* `u.bluebirdVersion` - either `2` or `3`
* `u.nodeVersion` - either `'0.10'`, `'0.12'`, `'4'` or `'6'`

##### `u.test()`

`u.test()` is used rather than `mocha`'s `it` throughout the tests. It calls the test function with a `Test` object with `.done()` and `.error()` methods. The `Test` class is defined in `test/utils/ctors.js`. The test object is commonly referred to as `t`.

`t.done()` expects to be passed a promise which will be awaited before the ending the test. It also accepts an optional 2nd argument `final` which should be a function to be run after the promise settles but before the test completes. It's a last chance to register an error.

If the promise is expected to reject it is marked as such with `u.setRejectStatus(promise)`. Otherwise a rejected promise's rejection reason is registered as an error on the test, and the test fails.

`t.error()` registers an error as the result of the test. If any value other than `undefined` is provided, this will be registered as the result of the test. `t.error(undefined)` does nothing. The test will continue to completion, and whichever was the first error registered is the result of the test. If no errors have been registered, the test is a success.

`u.testMultiple()` is the same as `u.test()` but runs the test 3 times in parallel - if any of the runs fails, the test as a whole fails.

##### Describe sets

`test/support/utils/describeSets.js` contains various common combinations of test inputs e.g. different promises resolved/rejected sync/async. Any `describeSet` function will create a set of `mocha` `describe` statments and call the test function back for each one.

##### Test sets

`test/support/utils/testSets` folder contains sets of tests which apply to various types of methods under test. e.g. `u.testSetCallbackAsyncProto()` runs a set of tests on a prototype method which takes a callback function to ensure the callback is always called async.

`test/support/utils/testSets/groups.js` contains sets of tests covering all the areas mentioned above for a certain type of Bluebird method. e.g. `u.testGroupStaticAsyncArrayHandler()` runs all the tests for any static method that takes an array as input and is used for the tests for `Promise.map()`, `Promise.filter()`, `Promise.each()` etc.

##### Other util files

* `utils/checks.js` contains functions which check for a condition and return an error if there's a failure, or undefined if all good.
* `utils/tests.js` contains functions that run an actual test, calling `u.test()` and then passing any errors from a `check` function to `t.error()` to make the test fail.
* `utils/promises.js` contains functions to create return values and handlers to be used as callback functions for methods under test - e.g. promises which resolve/reject sync/async, errors, return values

## Bugs

Please report any bugs in cls-bluebird via Github issues. We'll endeavour to fix them and add additional test cases as quickly as possible.
