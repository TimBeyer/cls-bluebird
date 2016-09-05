#!/bin/bash

# `set -e` ensures an error stops whole script
# `set -o pipefail` makes script return error code if npm command produces error
# (without this the pipe to `tail` swallows any error code from `npm run test-main`)
set -e -o pipefail;

# Run tests/coveralls
# `tail` outputs only last 2MB of test output - workaround for Travis 4MB log limit
if [ $COVERAGE ];
    # Coveralls
    then echo 'Running Coveralls' && (npm run coveralls | tail -c 2097152);

    # Tests
    else npm run jshint && echo 'Running Tests' && (npm run test-main | tail -c 2097152);
fi
