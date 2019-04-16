import PropTypes from 'prop-types';

// Generate a test to make sure a given state matches the given prop type validation
export default (state, spec) => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it(`matches the given spec`, () => {
    PropTypes.checkPropTypes({ test: spec }, { test: state }, 'test', 'spec check');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
};
