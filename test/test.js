import jsdom from 'mocha-jsdom';
import chai, {expect} from 'chai';
import chaijQ from 'chai-jq';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import fs from 'fs';

chai.use(chaijQ);
chai.use(sinonChai);

const testHTML = fs.readFileSync('test/fixtures/basic.html', 'utf-8');

function resetDocument() {
  document.body.innerHTML = testHTML;
}

describe('Herotabs', () => {
  let $;

  jsdom();

  before(() => {
    $ = require('jquery');
    require('../src/');
  });

  describe('initialise', () => {
    let $tabs, pluginInstance;

    before(() => {
      resetDocument();

      $tabs = $('.tabs').herotabs({
        interactEvent: 'hover',
        css: {
          navId: 'test'
        }
      });
      pluginInstance = $tabs.data('herotabs');
    });

    it('should create an instance in data storage', () => {
      expect(pluginInstance).to.be.an.instanceOf($.fn.herotabs.Herotabs);
    });

    it('should expose default options', () => {
      expect($.fn.herotabs.defaults).to.be.an('object');
    });

    it('should allow user to override default options', () => {
      expect(pluginInstance.options.interactEvent).to.equal('hover');
      expect(pluginInstance.options.css.navId).to.equal('test');
      expect(pluginInstance.options.css.current).to.equal('is-current-pane');
    });

    it('should set an active class', function() {
      expect($tabs).to.have.$class('is-active');
    });
  });

  describe('ready and setup callbacks', () => {
    beforeEach(resetDocument);

    it('should call the onSetup callback before the plugin initialises', () => {
      const spy = sinon.spy();
      $('.tabs').herotabs({
        onSetup: spy
      });

      expect(spy).to.have.been.called;
    });

    it('should call the onReady callback when the plugin finishes initialise', () => {
      const spy = sinon.spy();
      $('.tabs').herotabs({
        onReady: spy
      });

      expect(spy).to.have.been.called;
    });
  });

  describe('checkUrlIsAnchor regex', () => {
    let checkUrlIsAnchor;

    before(() => {
      checkUrlIsAnchor = $.fn.herotabs.Herotabs.prototype._checkUrlIsAnchor;
    });

    it('should match hrefs that are anchor links', function() {
      expect(checkUrlIsAnchor('#href')).to.be.ok;
      expect(checkUrlIsAnchor('#href_foo')).to.be.ok;
      expect(checkUrlIsAnchor('#href-foo')).to.be.ok;
      expect(checkUrlIsAnchor('#hREffoo')).to.be.ok;
      expect(checkUrlIsAnchor('/#hREffoo')).to.be.ok;

      expect(checkUrlIsAnchor('http://google.com')).to.not.be.ok;
      expect(checkUrlIsAnchor('fooo')).to.not.be.ok;
      expect(checkUrlIsAnchor('')).to.not.be.ok;
    });
  });
});
