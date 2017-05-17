import chai, {expect} from 'chai';
import chaijQ from 'chai-jq';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import fs from 'fs';

chai.use(chaijQ);
chai.use(sinonChai);

const basicHTML = fs.readFileSync('test/fixtures/basic.html', 'utf-8');
const nestedHTML = fs.readFileSync('test/fixtures/nesting.html', 'utf-8');
const mixedHTML = fs.readFileSync('test/fixtures/mixed-elements.html', 'utf-8');

describe('transitionProps', () => {
  let transitionProps;

  beforeAll(() => {
    transitionProps = require('../src/transition-props');
  });

  it.only('should return an object with the transition props', () => {
    expect(transitionProps).to.eql(
      {js: 'webkitTransitionEnd', css: '-webkit-transition'}
    );
  });
});

describe('Herotabs', () => {
  let $, Herotabs;

  beforeAll(() => {
    $ = require('./jquery-1.12.0.min');
    Herotabs = require('../src/');
  });

  describe('initialise', () => {
    let $tabs, instance;

    beforeEach(() => {
      document.body.innerHTML = basicHTML;

      $tabs = $('.tabs').herotabs({
        interactEvent: 'hover',
        css: {
          navId: 'test',
        },
      });
      instance = $tabs.data('herotabs');
    });

    it('should create an instance in data storage', () => {
      expect(instance).to.be.an.instanceOf(Herotabs);
    });

    it('should expose default options', () => {
      expect($.fn.herotabs.defaults).to.be.an('object');
    });

    it('should allow user to override default options', () => {
      expect(instance.options.interactEvent).to.equal('hover');
      expect(instance.options.css.navId).to.equal('test');
      expect(instance.options.css.current).to.equal('is-current-pane');
    });

    it('should set an active class', () => {
      expect($tabs).to.have.$class('is-active');
    });
  });

  describe('ready and setup callbacks', () => {
    beforeEach(() => {
      document.body.innerHTML = basicHTML;
    });

    it('should call the onSetup callback before the plugin initialises', () => {
      const spy = sinon.spy();
      $('.tabs').herotabs({
        onSetup: spy,
      });

      expect(spy).to.have.been.called;
    });

    it('should call the onReady callback when the plugin finishes initialise', () => {
      const spy = sinon.spy();
      $('.tabs').herotabs({
        onReady: spy,
      });

      expect(spy).to.have.been.called;
    });
  });

  describe('checkUrlIsAnchor regex', () => {
    let checkUrlIsAnchor;

    beforeAll(() => {
      checkUrlIsAnchor = Herotabs.prototype.checkUrlIsAnchor;
    });

    it('should match hrefs that are anchor links', () => {
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

  runDOMTests('basic', basicHTML);
  runDOMTests('nested', nestedHTML);
  runDOMTests('mixed elements', mixedHTML);

  function runDOMTests(name, template) {
    describe(`plugin usage with ${name} html template`, () => {
      let $tabs,
        instance,
        $nav,
        $tabPanels;

      beforeEach(() => {
        document.body.innerHTML = template;

        $tabs = $('.tabs').herotabs();
        $nav = $('.js-herotabs-nav');
        $tabPanels = $('.js-herotabs-tab');
        instance = $tabs.data('herotabs');
      });

      afterEach(() => {
        $tabs.removeData('herotabs');
      });

      describe('initial state', () => {
        describe('nav', () => {
          it('should set roles on the navigation', () => {
            expect($nav).to.have.$attr('role', 'tablist');
            expect($nav.find('.js-herotabs-nav-item')).to.have.$attr('role', 'presentation');
            expect($nav.find('.js-herotabs-nav-item a')).to.have.$attr('role', 'tab');
          });

          it('should generate ids on the nav links', () => {
            $nav.find('a').each(function(index) {
              expect($(this)).to.have.$attr('id', `herotabs${instance.instanceId}-${index + 1}`);
            });
          });

          it('should set the first nav item to current', () => {
            expect($nav.find('.js-herotabs-nav-item').eq(0)).to.have.$class('is-current-nav');
            expect($nav.find('a').eq(0))
              .to.have.$attr('aria-selected', 'true')
              .and.to.have.$attr('tabindex', '0');
          });

          it('should not set the other nav items to current', () => {
            $nav.find('a').slice(1).each(function() {
              expect($(this)).to.not.have.$class('is-current-nav');
              expect($(this))
                .to.have.$attr('aria-selected', 'false')
                .and.to.have.$attr('tabindex', '-1');
            });
          });
        });

        describe('tab panels', () => {
          it('should set roles on the tab panels', () => {
            expect($tabPanels).to.have.$attr('role', 'tabpanel');
          });

          it('should link tab panels to their nav item ids', () => {
            $tabPanels.each(function(index) {
              expect($(this)).to.have.$attr('aria-labelledby', `herotabs${instance.instanceId}-${index + 1}`);
            });
          });

          it('should set the first tab panel to current and visible', () => {
            expect($tabPanels.eq(0))
            .to.have.$class('is-current-pane')
              .and.to.have.$attr('aria-hidden', 'false')
              .and.to.have.$attr('tabindex', '0')
              .and.to.have.$css('display', 'block');
          });

          it('should hide the remaining tab panels', () => {
            $tabPanels.slice(1).each(function() {
              expect($(this)).to.not.have.$class('is-current-pane');
              expect($(this))
                .to.have.$attr('aria-hidden', 'true')
                  .and.to.have.$attr('tabindex', '-1')
                  .and.to.have.$css('display', 'none');
            });
          });

          it('should set correct tabindex to links within the tab panels', () => {
            expect($tabPanels.eq(0).find('a')).to.have.$attr('tabindex', '0');
            $tabPanels.slice(1).each(function() {
              expect($(this)).to.have.$attr('tabindex', '-1');
            });
          });
        });
      });

      describe('public API', () => {
        describe('showTab()', () => {
          it('should show the second tab panel by using an index', () => {
            instance.showTab(1);

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'block');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should show the third tab panel by using a jQuery element', () => {
            instance.showTab($tabPanels.eq(2));

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'none');

            expect($tabPanels.eq(2)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'block');
          });

          it('should do nothing if an index is greater than the total elements', () => {
            instance.showTab(5);

            expect($tabPanels.eq(0)).to.have.$class('is-current-pane');

            expect($tabPanels.eq(1)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'none');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should return the instance', () => {
            expect(instance.showTab(1)).to.be.instanceOf($.fn.herotabs.Herotabs);
          });
        });

        describe('nextTab()', () => {
          it('should show the next tab', () => {
            instance.nextTab();

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'block');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should show the first tab if the last one is currently visible', () => {
            instance.showTab(2);
            instance.nextTab();

            expect($tabPanels.eq(0)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'block');

            expect($tabPanels.eq(1)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'none');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should return the instance', () => {
            expect(instance.nextTab()).to.be.instanceOf($.fn.herotabs.Herotabs);
          });
        });

        describe('prevTab()', () => {
          it('should show the previous tab', () => {
            instance.prevTab();

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(2)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'block');
          });

          it('should return the instance', () => {
            expect(instance.prevTab()).to.be.instanceOf($.fn.herotabs.Herotabs);
          });
        });

        describe('start() and stop()', () => {
          let clock;

          beforeEach(() => {
            document.body.innerHTML = template;
            clock = sinon.useFakeTimers();
          });

          afterEach(() => {
            clock.restore();
          });

          it('should show the next tab after the delay', () => {
            $tabs = $('.tabs').herotabs({delay: 300 });
            $tabPanels = $('.js-herotabs-tab');

            clock.tick(301);

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'block');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should allow the timer to be stopped', () => {
            $tabs = $('.tabs').herotabs({delay: 500 });
            $tabPanels = $('.js-herotabs-tab');
            instance = $tabs.data('herotabs');

            clock.tick(300);
            const ret = instance.stop();
            expect(ret).to.be.instanceOf($.fn.herotabs.Herotabs);

            expect($tabPanels.eq(0)).to.have.$class('is-current-pane');

            expect($tabPanels.eq(1)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'none');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should allow the timer to be started', () => {
            $tabs = $('.tabs').herotabs({delay: 200 });
            $tabPanels = $('.js-herotabs-tab');
            instance = $tabs.data('herotabs');

            clock.tick(300);
            instance.stop();

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'block');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');

            const ret = instance.start();
            clock.tick(300);

            expect(ret).to.be.instanceOf($.fn.herotabs.Herotabs);

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'none');

            expect($tabPanels.eq(2)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'block');
          });

          it('should return the instance on `.start()`', () => {
            $tabs = $('.tabs').herotabs({delay: 200 });
            instance = $tabs.data('herotabs');

            expect(instance.start()).to.be.instanceOf($.fn.herotabs.Herotabs);
          });

          it('should return the instance on `.stop()`', () => {
            $tabs = $('.tabs').herotabs({delay: 200 });
            instance = $tabs.data('herotabs');

            clock.tick(300);

            expect(instance.stop()).to.be.instanceOf($.fn.herotabs.Herotabs);
          });
        });

        describe('custom events', () => {
          it('should fire a `show` event with reference to the element that is visible', () => {
            const spy = sinon.spy();
            $tabs.on('herotabs.show', spy);
            instance.showTab(1);
            const args = spy.getCall(0).args;

            expect(args[1]).to.have.$class('tabpane2');
            expect(args[2]).to.equal(1);
            expect(args[3]).to.have.$class('navitem2');
          });

          it('should fire a `hide` event with reference to the element that was just hidden', () => {
            const spy = sinon.spy();
            $tabs.on('herotabs.hide', spy);
            instance.showTab(1);
            const args = spy.getCall(0).args;

            expect(args[1]).to.have.$class('tabpane1');
            expect(args[2]).to.equal(0);
            expect(args[3]).to.have.$class('navitem1');
          });

          it('should fire a `next` event', () => {
            const spy = sinon.spy();
            $tabs.on('herotabs.next', spy);
            instance.nextTab();
            const args = spy.getCall(0).args;

            expect(args[1]).to.have.$class('tabpane2');
            expect(args[2]).to.equal(1);
            expect(args[3]).to.have.$class('navitem2');
          });

          it('should fire a `prev` event', () => {
            const spy = sinon.spy();
            $tabs.on('herotabs.prev', spy);
            instance.prevTab();
            const args = spy.getCall(0).args;

            expect(args[1]).to.have.$class('tabpane3');
            expect(args[2]).to.equal(2);
            expect(args[3]).to.have.$class('navitem3');
          });

          it('should fire a `start` event', () => {
            const spy = sinon.spy();
            $tabs.on('herotabs.start', spy);
            instance.options.delay = 200;

            instance.start();

            const args = spy.getCall(0).args;

            expect(args[1]).to.have.$class('tabpane1');
            expect(args[2]).to.equal(0);
            expect(args[3]).to.have.$class('navitem1');
          });

          it('should fire a `stop` event', () => {
            const spy = sinon.spy();
            $tabs.on('herotabs.stop', spy);
            instance.options.delay = 200;

            instance.start();
            instance.stop();

            const args = spy.getCall(0).args;

            expect(args[1]).to.have.$class('tabpane1');
            expect(args[2]).to.equal(0);
            expect(args[3]).to.have.$class('navitem1');
          });

          it('should allow events to be fired manually', () => {
            const spy = sinon.spy();
            $tabs.on('herotabs.show', spy);
            instance.triggerEvent('herotabs.show', 1);

            const args = spy.getCall(0).args;

            expect(args[1]).to.have.$class('tabpane2');
            expect(args[2]).to.equal(1);
            expect(args[3]).to.have.$class('navitem2');
          });
        });

        describe('DOM events', () => {
          it('should change tab when second nav item is clicked', () => {
            $nav.trigger($.Event('click', {
              target: $nav.find('a').get(1),
            }));

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'block');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should change tab when the down arrow is pressed', () => {
            $nav.trigger($.Event('keydown', {
              target: $nav.find('a')[1],
              keyCode: 40,
            }));

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'block');

            expect($tabPanels.eq(2)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'none');
          });

          it('should show last tab when the up arrow is pressed', () => {
            $nav.trigger($.Event('keydown', {
              target: $nav.find('a')[1],
              keyCode: 38,
            }));

            expect($tabPanels.eq(0)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(0)).to.have.$css('display', 'none');

            expect($tabPanels.eq(1)).to.not.have.$class('is-current-pane');
            expect($tabPanels.eq(1)).to.have.$css('display', 'none');

            expect($tabPanels.eq(2)).to.have.$class('is-current-pane');
            expect($tabPanels.eq(2)).to.have.$css('display', 'block');
          });
        });
      });
    });
  }
});
