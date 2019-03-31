import PropTypes from 'prop-types';

class SpecTester {
  static _attachSetupMethods() {
    const spy = {};

    beforeEach(() => {
      spy.error = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      spy.error.mockRestore();
    });

    return spy;
  }

  constructor(spec, baseState) {
    this._spec = spec;
    this._baseState = baseState;
    this._setupAttached = false;
    this._idx = 0;
  }

  // Run a spec test and resolve/throw based on isValid
  // If keyname is passed, that key will be overwritten from the
  // base state, otherwise the full value will be used as the state to check
  checkSpec(value, keyName) {
    const specWrapper = { test: this._spec };
    const testState = { test: value };
    if (keyName) {
      // If keyname is passed in use the baseState and set only a specific key to the value
      testState.test = {
        ...this._baseState,
        [keyName]: value,
      };
    }
    const errorSpy = jest.spyOn(console, 'error');
    PropTypes.checkPropTypes(specWrapper, testState, 'test', `test${this._getIdx()}`);
    const pass = errorSpy.mock.calls.length === 0;
    errorSpy.mockRestore();
    return pass;
  }

  // Test a specific key that appears within the spec's properties
  testKey(valid, invalid, keyName) {
    describe(`${keyName} property`, () => {
      const spy = SpecTester._attachSetupMethods();
      this._genTests(valid, true, spy, keyName);
      this._genTests(invalid, false, spy, keyName);
    });
  }

  // Test a specific full value with the spec
  testValue(valid, invalid) {
    describe('full spec test', () => {
      const spy = SpecTester._attachSetupMethods();
      this._genTests(valid, true, spy);
      this._genTests(invalid, false, spy);
    });
  }

  // Generate a test for the given value compared to the spec
  //
  // If keyName is passed in the given value will be added as a property
  // to the baseState with the given keyName
  //
  // If no keyName is passed, the given value will act as the full object
  // to test against the spec
  _genTest(value, isValid, spy, keyName) {
    const resultStr = isValid ? 'succeed' : 'fail';
    const stateStr = isValid ? 'valid' : 'invalid';
    const destStr = keyName ? `"${keyName}"` : 'spec';
    const testDescription = `should ${resultStr} when ${stateStr} value "${value}" is passed to ${destStr}`;
    it(testDescription, () => {
      const specWrapper = { test: this._spec };
      const testState = { test: value };
      if (keyName) {
        // If keyname is passed in use the baseState and set only a specific key to the value
        testState.test = {
          ...this._baseState,
          [keyName]: value,
        };
      }
      PropTypes.checkPropTypes(specWrapper, testState, 'test', `test${this._getIdx()}`);
      if (isValid) {
        expect(spy.error).not.toHaveBeenCalled();
      } else {
        expect(spy.error).toHaveBeenCalled();
      }
    });
  }

  // Abstraction of _genTest to support a single value or
  // array of inputs. If input is an array, a test will be generated
  // for each entry in the array. Otherwise input will be used in a
  // single test as the value
  //
  // the keyName variable is just forwarded to the _genTest method
  _genTests(input, isValid, spy, keyName) {
    if (Array.isArray(input)) {
      input.forEach(value => this._genTest(value, isValid, spy, keyName));
    } else {
      this._genTest(input, isValid, spy, keyName);
    }
  }

  // Helper method to generate "unique" test components
  // PropTypes will silence similar warnings from the same component
  // so we need to make each component unique when testing, allowing the
  // error message to always print and be caught by the spy.
  _getIdx() {
    this._idx += 1;
    return this._idx;
  }
}

export default SpecTester;
