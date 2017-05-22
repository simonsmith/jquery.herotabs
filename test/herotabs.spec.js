/* eslint-disable no-new */

import chai, {expect} from 'chai';
import chaijQ from 'chai-jq';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import fs from 'fs';

chai.use(chaijQ);
chai.use(sinonChai);

const template = fs.readFileSync('test/fixtures/template.html', 'utf-8');

function setBody(html) {
  document.body.innerHTML = html;
}

function resetBody() {
  document.body.innerHTML = '';
}

describe('jquery.herotabs', () => {
  let $, Herotabs;

  beforeEach(() => {
    jest.resetModules();
    $ = require('./fixtures/jquery-1.12.0.min');
    Herotabs = require('../src/');
  });

  afterEach(resetBody);

  describe('initialising the Herotabs instance', () => {
    test('register as a function on the jQuery prototype', () => {
      expect($.fn.herotabs).to.be.a('function');
    });

    test('expose default options', () => {
      expect($.fn.herotabs.defaults).to.be.an('object');
    });

    test('keeps track of instances with an id', () => {
      const instance1 = new Herotabs($('<div/>'));
      const instance2 = new Herotabs($('<div/>'));
      expect(instance1.instanceId).to.equal(1);
      expect(instance2.instanceId).to.equal(2);
    });

    test('allow defaults to be overridden in options object', () => {
      const instance = new Herotabs($('<div/>'), {
        duration: 4000,
        css: {
          navId: 'test',
        },
      });
      expect(instance.options.duration).to.equal(4000);
      expect(instance.options.css.navId).to.equal('test');
    });

    test('set an active class on the container element', () => {
      const $elem = $('<div/>');
      new Herotabs($elem);
      expect($elem)
        .to.have.$class('is-active')
        .and.to.have.$css('position', 'relative');
    });

    test('call the setup function', () => {
      const spy = sinon.spy();
      new Herotabs($('<div/>'), {
        onSetup: spy,
      });
      expect(spy).to.have.been.calledOnce;
    });

    test('call the ready function', () => {
      const spy = sinon.spy();
      new Herotabs($('<div/>'), {
        onReady: spy,
      });
      expect(spy).to.have.been.calledOnce;
    });
  });

  describe('checkUrlIsAnchor regex', () => {
    test('should match hrefs that are anchor links', () => {
      const {checkUrlIsAnchor} = Herotabs;

      expect(checkUrlIsAnchor('#href')).to.be.ok;
      expect(checkUrlIsAnchor('#href_foo')).to.be.ok;
      expect(checkUrlIsAnchor('#href-foo')).to.be.ok;
      expect(checkUrlIsAnchor('#hREffoo')).to.be.ok;
      expect(checkUrlIsAnchor('/#hREffoo')).to.be.ok;
      expect(checkUrlIsAnchor('http://google.com')).to.not.be.ok;
      expect(checkUrlIsAnchor('http://google.com/#')).to.not.be.ok;
      expect(checkUrlIsAnchor('fooo')).to.not.be.ok;
      expect(checkUrlIsAnchor('')).to.not.be.ok;
    });
  });

  describe('initial DOM state', () => {
    let $nav, $content;

    beforeEach(() => {
      setBody(template);
      $('.tabs').herotabs();
      $nav = $('.js-herotabs-nav');
      $content = $('.js-herotabs-tab');
    });

    describe('navigation', () => {
      test('set aria roles', () => {
        expect($nav)
          .to.have.$attr('role', 'tablist');
        expect($nav.find('.js-herotabs-nav-item'))
          .to.have.$attr('role', 'presentation');
        expect($nav.find('.js-herotabs-nav-item a'))
          .to.have.$attr('role', 'tab');
      });

      test('generate ids on each nav links', () => {
        $nav.find('a').each(function(index) {
          expect($(this)).to.have.$attr('id', `herotabs1-${index + 1}`);
        });
      });

      test('set the first nav item to current selected', () => {
        expect($nav.find('.js-herotabs-nav-item').eq(0))
          .to.have.$class('is-current-nav');
        expect($nav.find('a').eq(0))
          .to.have.$attr('aria-selected', 'true')
          .and.to.have.$attr('tabindex', '0');
      });

      test('other nav items should not be current selected', () => {
        $nav.find('a').slice(1).each(function() {
          expect($(this))
            .to.not.have.$class('is-current-nav');
          expect($(this))
            .to.have.$attr('aria-selected', 'false')
            .and.to.have.$attr('tabindex', '-1');
        });
      });
    });

    describe('tab content', () => {
      test('set aria roles on the tab content', () => {
        expect($content)
          .to.have.$attr('role', 'tabpanel');
      });

      test('link tab content to their nav item ids', () => {
        $content.each(function(index) {
          expect($(this))
            .to.have.$attr('aria-labelledby', `herotabs1-${index + 1}`);
        });
      });

      test('set the first tab panel to current and visible', () => {
        expect($content.eq(0))
          .to.have.$class('is-current-pane')
          .and.to.have.$attr('aria-hidden', 'false')
          .and.to.have.$attr('tabindex', '0')
          .and.to.have.$css('display', 'block');
      });

      test('hide the remaining tab panels', () => {
        $content.slice(1).each(function() {
          expect($(this))
            .to.not.have.$class('is-current-pane');
          expect($(this))
            .to.have.$attr('aria-hidden', 'true')
            .and.to.have.$attr('tabindex', '-1')
            .and.to.have.$css('display', 'none');
        });
      });

      test('should set correct tabindex to links within the tab panels', () => {
        expect($content.eq(0).find('a'))
          .to.have.$attr('tabindex', '0');

        $content.slice(1).each(function() {
          expect($(this))
            .to.have.$attr('tabindex', '-1');
        });
      });
    });
  });

  describe('public instance methods', () => {
    describe('.showTab()', () => {
      let $content, instance;

      beforeEach(() => {
        setBody(template);
        const $container = $('.tabs').herotabs();
        $content = $('.js-herotabs-tab');
        instance = $container.data('herotabs');
      });

      test('show the second tab panel by using an index', () => {
        instance.showTab(1);

        expect($content.eq(0)).to.not.have.$class('is-current-pane');
        expect($content.eq(0)).to.have.$css('display', 'none');

        expect($content.eq(1)).to.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'block');

        expect($content.eq(2)).to.not.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'none');
      });

      test('show the third tab panel by using a jQuery element instead of index', () => {
        instance.showTab($content.eq(2));

        expect($content.eq(0)).to.not.have.$class('is-current-pane');
        expect($content.eq(0)).to.have.$css('display', 'none');

        expect($content.eq(1)).to.not.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'none');

        expect($content.eq(2)).to.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'block');
      });

      test('do nothing if the index is greater than the total tab elements', () => {
        instance.showTab(5);

        expect($content.eq(0)).to.have.$class('is-current-pane');

        expect($content.eq(1)).to.not.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'none');

        expect($content.eq(2)).to.not.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'none');
      });

      test('should return the instance', () => {
        expect(instance.showTab(1)).to.be.instanceOf($.fn.herotabs.Herotabs);
      });
    });

    describe('.nextTab()', () => {
      let $content, instance;

      beforeEach(() => {
        setBody(template);
        const $container = $('.tabs').herotabs();
        $content = $('.js-herotabs-tab');
        instance = $container.data('herotabs');
      });

      test('show the next tab', () => {
        instance.nextTab();

        expect($content.eq(0)).to.not.have.$class('is-current-pane');
        expect($content.eq(0)).to.have.$css('display', 'none');

        expect($content.eq(1)).to.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'block');

        expect($content.eq(2)).to.not.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'none');
      });

      test('show the first tab if the last one is currently visible', () => {
        instance.showTab(2);
        instance.nextTab();

        expect($content.eq(0)).to.have.$class('is-current-pane');
        expect($content.eq(0)).to.have.$css('display', 'block');

        expect($content.eq(1)).to.not.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'none');

        expect($content.eq(2)).to.not.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'none');
      });

      test('return the instance', () => {
        expect(instance.nextTab()).to.be.instanceOf($.fn.herotabs.Herotabs);
      });
    });

    describe('.prevTab()', () => {
      let $content, instance;

      beforeEach(() => {
        setBody(template);
        const $container = $('.tabs').herotabs();
        $content = $('.js-herotabs-tab');
        instance = $container.data('herotabs');
      });

      test('show the previous tab', () => {
        instance.prevTab();

        expect($content.eq(0)).to.not.have.$class('is-current-pane');
        expect($content.eq(0)).to.have.$css('display', 'none');

        expect($content.eq(2)).to.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'block');
      });

      test('return the instance', () => {
        expect(instance.prevTab()).to.be.instanceOf($.fn.herotabs.Herotabs);
      });
    });

    describe('.start()', () => {
      let $content, instance, clock;

      beforeEach(() => {
        setBody(template);
        clock = sinon.useFakeTimers();
        const $container = $('.tabs').herotabs({delay: 200});
        $content = $('.js-herotabs-tab');
        instance = $container.data('herotabs');
      });

      afterEach(() => {
        clock.restore();
      });

      test('allow the timer to be started', () => {
        clock.tick(300);
        instance.stop();

        expect($content.eq(0)).to.not.have.$class('is-current-pane');
        expect($content.eq(0)).to.have.$css('display', 'none');

        expect($content.eq(1)).to.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'block');

        expect($content.eq(2)).to.not.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'none');

        instance.start();
        clock.tick(300);

        expect($content.eq(0)).to.not.have.$class('is-current-pane');
        expect($content.eq(0)).to.have.$css('display', 'none');

        expect($content.eq(1)).to.not.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'none');

        expect($content.eq(2)).to.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'block');
      });

      test('return the instance', () => {
        expect(instance.start()).to.be.instanceOf($.fn.herotabs.Herotabs);
      });
    });

    describe('.stop()', () => {
      let $content, instance, clock;

      beforeEach(() => {
        setBody(template);
        clock = sinon.useFakeTimers();
        const $container = $('.tabs').herotabs({delay: 500});
        $content = $('.js-herotabs-tab');
        instance = $container.data('herotabs');
      });

      afterEach(() => {
        clock.restore();
      });

      test('allow the timer to be stopped', () => {
        clock.tick(300);
        instance.stop();

        expect($content.eq(0)).to.have.$class('is-current-pane');

        expect($content.eq(1)).to.not.have.$class('is-current-pane');
        expect($content.eq(1)).to.have.$css('display', 'none');

        expect($content.eq(2)).to.not.have.$class('is-current-pane');
        expect($content.eq(2)).to.have.$css('display', 'none');
      });

      test('return the instance', () => {
        expect(instance.stop()).to.be.instanceOf($.fn.herotabs.Herotabs);
      });
    });
  });

  describe('switching tab after delay', () => {
    let $content, clock;

    beforeEach(() => {
      setBody(template);
      clock = sinon.useFakeTimers();
      $('.tabs').herotabs({delay: 300});
      $content = $('.js-herotabs-tab');
    });

    afterEach(() => {
      clock.restore();
    });

    test('show second tab after delay passes', () => {
      clock.tick(301);

      expect($content.eq(0)).to.not.have.$class('is-current-pane');
      expect($content.eq(0)).to.have.$css('display', 'none');

      expect($content.eq(1)).to.have.$class('is-current-pane');
      expect($content.eq(1)).to.have.$css('display', 'block');

      expect($content.eq(2)).to.not.have.$class('is-current-pane');
      expect($content.eq(2)).to.have.$css('display', 'none');
    });
  });

  describe('custom events', () => {
    let $container, instance;

    beforeEach(() => {
      setBody(template);
      $container = $('.tabs').herotabs();
      instance = $container.data('herotabs');
    });

    test('`show` event with reference to element that is visible', () => {
      const spy = sinon.spy();
      $container.on('herotabs.show', spy);
      instance.showTab(1);
      const args = spy.getCall(0).args;

      expect(args[1]).to.have.$class('tabpane2');
      expect(args[2]).to.equal(1);
      expect(args[3]).to.have.$class('navitem2');
    });

    test('`hide` event with reference to element last hidden', () => {
      const spy = sinon.spy();
      $container.on('herotabs.hide', spy);
      instance.showTab(1);
      const args = spy.getCall(0).args;

      expect(args[1]).to.have.$class('tabpane1');
      expect(args[2]).to.equal(0);
      expect(args[3]).to.have.$class('navitem1');
    });

    test('`next` event', () => {
      const spy = sinon.spy();
      $container.on('herotabs.next', spy);
      instance.nextTab();
      const args = spy.getCall(0).args;

      expect(args[1]).to.have.$class('tabpane2');
      expect(args[2]).to.equal(1);
      expect(args[3]).to.have.$class('navitem2');
    });

    test('`prev` event', () => {
      const spy = sinon.spy();
      $container.on('herotabs.prev', spy);
      instance.prevTab();
      const args = spy.getCall(0).args;

      expect(args[1]).to.have.$class('tabpane3');
      expect(args[2]).to.equal(2);
      expect(args[3]).to.have.$class('navitem3');
    });

    test('`start` event', () => {
      const spy = sinon.spy();
      $container.on('herotabs.start', spy);

      instance.options.delay = 200;
      instance.start();

      const args = spy.getCall(0).args;

      expect(args[1]).to.have.$class('tabpane1');
      expect(args[2]).to.equal(0);
      expect(args[3]).to.have.$class('navitem1');
    });

    test('`stop` event', () => {
      const spy = sinon.spy();
      $container.on('herotabs.stop', spy);

      instance.options.delay = 200;
      instance.start();
      instance.stop();

      const args = spy.getCall(0).args;

      expect(args[1]).to.have.$class('tabpane1');
      expect(args[2]).to.equal(0);
      expect(args[3]).to.have.$class('navitem1');
    });

    test('allow events to be fired manually', () => {
      const spy = sinon.spy();
      $container.on('herotabs.show', spy);
      instance.triggerEvent('herotabs.show', 1);

      const args = spy.getCall(0).args;

      expect(args[1]).to.have.$class('tabpane2');
      expect(args[2]).to.equal(1);
      expect(args[3]).to.have.$class('navitem2');
    });
  });

  describe('DOM events', () => {
    let $content, $nav;

    beforeEach(() => {
      setBody(template);
      $('.tabs').herotabs();
      $nav = $('.js-herotabs-nav');
      $content = $('.js-herotabs-tab');
    });

    test('change tab when second nav item is clicked', () => {
      $nav.trigger($.Event('click', {
        target: $nav.find('a').get(1),
      }));

      expect($content.eq(0)).to.not.have.$class('is-current-pane');
      expect($content.eq(0)).to.have.$css('display', 'none');

      expect($content.eq(1)).to.have.$class('is-current-pane');
      expect($content.eq(1)).to.have.$css('display', 'block');

      expect($content.eq(2)).to.not.have.$class('is-current-pane');
      expect($content.eq(2)).to.have.$css('display', 'none');
    });

    it('should change tab when the down arrow is pressed', () => {
      $nav.trigger($.Event('keydown', {
        target: $nav.find('a')[1],
        keyCode: 40,
      }));

      expect($content.eq(0)).to.not.have.$class('is-current-pane');
      expect($content.eq(0)).to.have.$css('display', 'none');

      expect($content.eq(1)).to.have.$class('is-current-pane');
      expect($content.eq(1)).to.have.$css('display', 'block');

      expect($content.eq(2)).to.not.have.$class('is-current-pane');
      expect($content.eq(2)).to.have.$css('display', 'none');
    });

    test('show last tab when the up arrow is pressed', () => {
      $nav.trigger($.Event('keydown', {
        target: $nav.find('a')[1],
        keyCode: 38,
      }));

      expect($content.eq(0)).to.not.have.$class('is-current-pane');
      expect($content.eq(0)).to.have.$css('display', 'none');

      expect($content.eq(1)).to.not.have.$class('is-current-pane');
      expect($content.eq(1)).to.have.$css('display', 'none');

      expect($content.eq(2)).to.have.$class('is-current-pane');
      expect($content.eq(2)).to.have.$css('display', 'block');
    });
  });
});
