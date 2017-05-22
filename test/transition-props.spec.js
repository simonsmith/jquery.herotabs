import {expect} from 'chai';

describe('transitionProps', () => {
  let transitionProps;

  beforeAll(() => {
    transitionProps = require('../src/transition-props');
  });

  it('should return an object with the transition props', () => {
    expect(transitionProps).to.eql(
      {js: 'webkitTransitionEnd', css: '-webkit-transition'}
    );
  });
});
