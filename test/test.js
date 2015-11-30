import jsdom from 'mocha-jsdom';
import chai, {expect} from 'chai';
import chaijQ from 'chai-jq';

chai.use(chaijQ);

describe('Herotabs', () => {
  let $;

  jsdom({
    file: 'test/fixtures/basic.html'
  });

  before(() => {
    $ = require('jquery');
    require('../src/');
  });
});
