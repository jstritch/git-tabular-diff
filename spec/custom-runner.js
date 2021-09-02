'use babel';

const { createRunner } = require('atom-jasmine3-test-runner');

export default createRunner({
  specHelper: {
    atom: true,
    attachToDom: true,
    ci: true,
    customMatchers: true,
    jasmineFocused: true,
    jasmineJson: true,
    jasminePass: true,
    jasmineTagged: true,
    mockClock: false,
    mockLocalStorage: false,
    profile: true,
    set: true,
    unspy: true
  },
});
