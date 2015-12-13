import $ from 'jquery';
import transitionProps from './transition-props';

let instanceId = 0;

class Herotabs {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.currentTab = null;
    this.timer = null;
    this.instanceId = ++instanceId;
    this.opacityTransition = `opacity ${(parseInt(options.duration, 10) / 1000)}s ${options.easing}`;

    options.onSetup.call(this);

    // Get reference to the elements
    const selectors = this.options.selectors;
    this.tab = this.container.find(selectors.tab);
    this.nav = this.container.find(selectors.nav);
    this.navItem = this.container.find(selectors.navItem);

    if (this.nav.length) {
      this.ariafy();
      this.setCurrentNav();
      this.attachNavEvents();
    }

    this.showInitialTab(options.startOn);
    this.attachKeyEvents();

    // Begin cycling through tabs if a delay has been set
    if (parseInt(options.delay, 10)) {
      this.start();
      this.attachHoverEvents();
    }

    container
      .addClass(options.css.active)
      .css('position', 'relative');

    options.onReady.call(this);
  }

  /**
   * Public API
   */

  showTab(tabToShow) {
    tabToShow = this.getTab(tabToShow);

    const currentTab = this.currentTab;

    // Exit if there is no tab to show or the same one
    // is already showing
    if (!tabToShow.length || currentTab.is(tabToShow)) {
      return this;
    }

    // Stop any running animations by removing properties. This
    // also stops transitionend firing if animation is halfway through
    this.tab
      .css(transitionProps.css, '')
      .css('opacity', '');

    // If animations have been stopped by the above then tab states need to
    // be manually set to their finished states had the animation been allowed
    // to complete originally.
    // This is similar to jQuery's .finish() and means
    // tabs can be cycled rapidly without overlapping animations
    this.setTabVisibilty(currentTab, this.tab.not(currentTab));

    // Prepare the next tab to be shown. This ensures it is beneath the
    // current one to enable a smooth transition
    tabToShow
      .show()
      .css({
        'position': 'absolute'
      });

    if (parseInt(this.options.duration, 10)) {
      // When the animation has finished, reset the states.
      // This is important because a tab pane has position: absolute
      // set during animation and it needs to be set back
      // after to maintain heights etc.
      currentTab
        .one(transitionProps.js, () => {
          this.setTabVisibilty(tabToShow, currentTab);
          this.triggerEvent('herotabs.hide', currentTab);
        });
    } else {
      // If duration is 0s, this needs to be called manually
      // as transitionend does not fire
      this.setTabVisibilty(tabToShow, currentTab);
      this.triggerEvent('herotabs.hide', currentTab);
    }

    // Trigger the animation
    currentTab
      .css(transitionProps.css, this.opacityTransition)
      .css('opacity', 0);

    this.triggerEvent('herotabs.show', tabToShow);

    // Update reference to the current tab
    this.currentTab = tabToShow;

    return this;
  }

  nextTab() {
    const currentIndex = this.tab.index(this.currentTab);
    let nextTabElement = this.tab.eq(currentIndex + 1);
    nextTabElement = (nextTabElement.length > 0 ? nextTabElement : this.tab.eq(0));

    this.showTab(nextTabElement);
    this.triggerEvent('herotabs.next', nextTabElement);

    return this;
  }

  prevTab() {
    const currentIndex = this.tab.index(this.currentTab);

    // Assume that if currentIndex is 0 the first tab is currently
    // selected so grab the last one.
    const prevTabElement = this.tab.eq(currentIndex === 0 ? -1 : currentIndex - 1);

    this.showTab(prevTabElement);
    this.triggerEvent('herotabs.prev', prevTabElement);

    return this;
  }

  start() {
    const opt = this.options;

    if (!opt.delay) {
      return this;
    }

    this.timer = setInterval(() => {
      if (this.navItemHasFocus()) {
        return;
      }

      if (!opt.reverse) {
        this.nextTab();
      } else {
        this.prevTab();
      }
    }, opt.delay);

    this.triggerEvent('herotabs.start', this.currentTab);

    return this;
  }

  stop() {
    clearInterval(this.timer);
    this.triggerEvent('herotabs.stop', this.currentTab);

    return this;
  }

  triggerEvent(eventName, tabToShow) {
    tabToShow = this.getTab(tabToShow);
    const index = this.tab.index(tabToShow);

    this.container.trigger(eventName, [tabToShow, index, this.navItem.eq(index)]);
  }

  /**
   * Private methods
   */

  getTab(tab) {
    return (typeof tab !== 'number' ? tab : this.tab.eq(tab));
  }

  showInitialTab(startOn) {
    // Check whether there is a tab selected by the URL hash
    const tabFromHash = location.hash && this.tab.filter(location.hash);
    const initialTab = tabFromHash.length === 0 ? this.tab.eq(startOn) : tabFromHash;

    this.tab.css('top', 0);
    this.setTabVisibilty(initialTab, this.tab.not(initialTab));

    this.triggerEvent('herotabs.show', initialTab);
    this.currentTab = initialTab;
  }

  setTabVisibilty(tabToShow, tabToHide) {
    const { css, zIndex } = this.options;

    tabToShow
      .addClass(css.current)
      .css({
        'z-index': zIndex.top,
        position: 'relative'
      })
      .attr('aria-hidden', false)
      .find('a')
      .addBack()
      .attr('tabindex', '0');

    tabToHide
      .removeClass(css.current)
      .css({
        'z-index': zIndex.bottom
      })
      .hide()
      .attr('aria-hidden', true)
      .find('a')
      .addBack()
      .attr('tabindex', '-1');
  }

  ariafy() {
    const navId = `${this.options.css.navId}${this.instanceId}-`;

    this.nav.attr('role', 'tablist');
    this.navItem
      .attr('role', 'presentation')
      .find('a')
      .each(function(index) {
        $(this).attr({
          id: navId + (index + 1),
          role: 'tab'
        });
      });

    this.tab.each(function(index) {
      $(this).attr({
        role: 'tabpanel',
        'aria-labelledby': navId + (index + 1)
      });
    });
  }

  attachHoverEvents() {
    this.container.on('mouseenter', () => {
      this.stop();
      this.triggerEvent('herotabs.mouseenter', this.currentTab);
    });

    this.container.on('mouseleave', () => {
      this.start();
      this.triggerEvent('herotabs.mouseleave', this.currentTab);
    });
  }

  attachKeyEvents() {
    this.nav.on('keydown', 'a', (event) => {
      switch (event.keyCode) {
        case 37: // Left
        case 38: // Up
          this.prevTab();
          break;
        case 39: // Right
        case 40: // Down
          this.nextTab();
          break;
      }
    });
  }

  isTouchEnabled() {
    return ('ontouchstart' in document.documentElement) && this.options.useTouch;
  }

  getEventType() {
    const eventMap = {
      hover: 'mouseenter',
      touch: 'touchstart',
      click: 'click'
    };

    // If touch is supported then override the event in options
    return (this.isTouchEnabled() ? eventMap.touch : eventMap[this.options.interactEvent]);
  }

  attachNavEvents() {
    const eventType = this.getEventType();
    const self = this;

    this.nav.on(eventType, 'a', function(event) {
      self.showTab($(this).parents(self.options.selectors.navItem).index());

      // Only preventDefault if link is an anchor.
      // Allows nav links to use external urls
      if (self.checkUrlIsAnchor(this.href)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  checkUrlIsAnchor(url) {
    // Check if url is a hash anchor e.g #foo, #foo-123 etc
    return /#[A-Za-z0-9-_]+$/.test(url);
  }

  navItemHasFocus() {
    // Only change focus if the user is focused inside the container already.
    // This stops the tabs stealing focus if the user is somewhere else
    // For example if the tabs are on a delay and the user is focused
    // elsewhere it would be annoying to have focus snap back
    // to the tabs every time an item changed
    return $(document.activeElement).closest(this.container).is(this.container);
  }

  setCurrentNav() {
    const current = this.options.css.navCurrent;

    this.container.on('herotabs.show', (event, tab, index) => {
      this.navItem
        .removeClass(current)
        .find('a')
        .each(function() {
          $(this).attr({
            'aria-selected': 'false',
            tabindex: '-1'
          });
        });

      // Current nav item link
      const navItemLink = this.navItem
        .eq(index)
        .addClass(current)
        .find('a');

      navItemLink.attr({
        'aria-selected': 'true',
        tabindex: '0'
      });

      if (this.navItemHasFocus()) {
        navItemLink.focus();
      }
    });
  }
}


// Override showTab method if browser does not support transitions
if (transitionProps.css === undefined) {
  Herotabs.prototype.showTab = function(tabToShow) {
    tabToShow = this.getTab(tabToShow);

    const currentTab = this.currentTab;

    // Exit if there is no tab to show or the same one
    // is already showing
    if (tabToShow.length === 0 || currentTab.is(tabToShow)) {
      return this;
    }

    // Quit any running animations first
    this.tab.finish();

    // The next tab to be shown needs position: absolute to allow
    // it to be under the current tab as it begins animation. Once the
    // current tab has finished animating the next tab will
    // have position: relative reapplied so it maintains the
    // height of the herotabs in the DOM.
    tabToShow
      .show()
      .css({
        'position': 'absolute',
        'opacity': 1
      });

    // Animate the current tab and set visibility when
    // the animation has completed
    currentTab.animate({opacity: 0}, this.options.duration, () => {
      this.setTabVisibilty(tabToShow, currentTab);
    });

    // Trigger event outside of .animate()
    // Allows user to use keyboard navigation and skip a tab
    // without waiting for animations to finish
    this.triggerEvent('herotabs.show', tabToShow);

    // Update reference to the current tab
    this.currentTab = tabToShow;

    return this;
  };
}

/**
 * Create the plugin
 * */

$.fn.herotabs = function(options) {
  const mergedOpts = $.extend(true, {}, $.fn.herotabs.defaults, options);

  return this.each(function() {
    const $this = $(this);

    if (!$this.data('herotabs')) {
      $this.data('herotabs', new Herotabs($this, mergedOpts));
    }
  });
};

$.fn.herotabs.Herotabs = Herotabs;
$.fn.herotabs.defaults = {
  delay: 0,
  duration: 0,
  easing: 'ease-in-out',
  startOn: 0,
  reverse: false,
  interactEvent: 'click',
  useTouch: true,
  onSetup: $.noop,
  onReady: $.noop,
  css: {
    active: 'is-active',
    current: 'is-current-pane',
    navCurrent: 'is-current-nav',
    navId: 'herotabs'
  },
  selectors: {
    tab: '.js-herotabs-tab',
    nav: '.js-herotabs-nav',
    navItem: '.js-herotabs-nav-item'
  },
  zIndex: {
    bottom: 1,
    top: 2
  }
};
