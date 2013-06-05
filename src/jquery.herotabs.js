/** @preserve
 * jquery.herotabs
 * version 1.0.1;
 * https://github.com/simonsmith/jquery.herotabs
 * @blinkdesign
 */

!function(global) {
    'use strict';

    var defaults = {
        delay: 0,
        startOn: 0,
        reverse: false,
        interactEvent: 'click',
        useTouch: true,
        css: {
            active:     'is-active',
            current:    'tab-current',
            navCurrent: 'tab-nav-current',
            navId:      'tabnav'
        },
        selectors: {
            tab:       '.js-tab',
            nav:       '.js-nav',
            navItem:   '.js-nav-item'
        }
    };

    var wrap = function($) {

        var Herotabs = function(container, options) {
            this.container         = container;
            this.options           = options;

            this._currentTab       = null;
            this._timer            = null;
            this._isTouchEnabled   = ('ontouchend' in document.documentElement) && this.options.useTouch;

            this._getDOMElements();

            if (this.nav.length > 0) {
                this._ariafy();
                this._setCurrentNav();
                this._attachNavEvents();
            }

            this.showTab(options.startOn);
            this._attachKeyEvents();

            if (options.delay > 0 && !this._isTouchEnabled) {
                this.start();
                this._attachHoverEvents();
            }

            container.addClass(options.css.active);
        };

        Herotabs.prototype = {
            constructor: Herotabs,

            showTab: function(tabToShow) {
                tabToShow = (typeof tabToShow != 'number' ? tabToShow : this.tab.eq(tabToShow));

                if (tabToShow.length == 0) {
                    return this;
                }

                var opt = this.options;

                // Handle no current tab on first load
                // Sets initial hidden state for all tab items
                if (this._currentTab == null) {
                    this._currentTab = this.tab;
                }

                this._currentTab
                    .removeClass(opt.css.current)
                    .hide()
                    .attr('aria-hidden', true)
                    .find('a')
                    .addBack()
                    .attr('tabindex', '-1');
                
                tabToShow
                    .addClass(opt.css.current)
                    .show()
                    .attr('aria-hidden', false)
                    .find('a')
                    .addBack()
                    .attr('tabindex', '0');

                this._currentTab = tabToShow;
                this.container.trigger('herotabs.show', this._getEventData(tabToShow));

                return this;
            },

            nextTab: function() {
                var currentIndex = this.tab.index(this._currentTab);
                var nextTab = this.tab.eq(currentIndex + 1);
                nextTab = (nextTab.length > 0 ? nextTab : this.tab.eq(0));

                this.showTab(nextTab);
                this.container.trigger('herotabs.next', this._getEventData(nextTab));

                return this;
            },

            prevTab: function() {
                var currentIndex = this.tab.index(this._currentTab);
                // Assume that if currentIndex is 0 the first tab is selected and
                // grab the last one.
                var prevTab = this.tab.eq(currentIndex == 0 ? -1 : currentIndex - 1);

                this.showTab(prevTab);
                this.container.trigger('herotabs.prev', this._getEventData(prevTab));

                return this;
            },

            start: function() {
                var opt = this.options;
                if (!opt.delay) {
                    return this;
                }

                var self     = this;
                var reverse  = opt.reverse;

                this._timer = setInterval(function() {
                    if (self._navItemHasFocus()) {
                        return;
                    }

                    if (!reverse) {
                        self.nextTab();
                    } else {
                        self.prevTab();
                    }
                }, opt.delay);

                this.container.trigger('herotabs.start', this._getEventData(this._currentTab));

                return this;
            },

            stop: function() {
                clearInterval(this._timer);

                this.container.trigger('herotabs.stop', this._getEventData(this._currentTab));

                return this;
            },

            _getDOMElements: function() {
                var selectors = this.options.selectors;

                for (var element in selectors) {
                    this[element] = this.container.find(selectors[element]);
                }
            },

            _getEventData: function(tab) {
                var index = this.tab.index(tab);

                return {
                    currentTab: tab,
                    currentTabIndex: index,
                    currentNavItem: this.navItem.eq(index)
                }
            },
            
            _ariafy: function() {
                var navId = this.options.css.navId;

                this.nav[0].setAttribute('role', 'tablist');
                this.navItem
                    .attr('role', 'presentation')
                    .find('a')
                    .each(function(index) {
                        this.id = navId + (index + 1);
                        this.setAttribute('role', 'tab');
                    });

                this.tab.each(function(index) {
                    this.setAttribute('role', 'tabpanel');
                    this.setAttribute('aria-labelledby', navId + (index + 1));
                });
            },

            _attachHoverEvents: function() {
                var self = this;

                this.container.on('mouseenter', function() {
                    self.stop();
                    $(this).trigger('herotabs.mouseenter', {
                        currentTab: self._currentTab
                    });
                });
                this.container.on('mouseleave', function() {
                    self.start();
                    $(this).trigger('herotabs.mouseleave', {
                        currentTab: self._currentTab
                    });
                });
            },
            
            _attachKeyEvents: function() {
                var self = this;

                this.nav.on('keydown', 'a', function(event) {
                    switch(event.keyCode) {
                        case 37: // Left
                        case 38: // Up
                            self.prevTab();
                        break;
                        case 39: // Right
                        case 40: // Down
                            self.nextTab();
                        break;
                    }
                });
            },

            _getEventType: function() {
                var eventMap = {
                    hover: 'mouseenter',
                    touch: 'touchend',
                    click: 'click'
                };

                return (this._isTouchEnabled ? eventMap.touch : eventMap[this.options.interactEvent]);
            },

            _attachNavEvents: function() {
                var nav       = this.nav;
                var eventType = this._getEventType();
                var opt       = this.options;
                var self      = this;
                
                nav.on(eventType, 'a', function(event) {
                    self.showTab($(this).parents(opt.selectors.navItem).index());

                    // Only preventDefault if link is an anchor.
                    // Allows nav links to use external urls
                    if (self._checkUrlIsAnchor(this.href)) {
                        event.preventDefault();
                    }
                });
            },

            // Check if url is a hash anchor e.g #foo, #foo-123 etc
            _isAnchorRegex: /#[A-Za-z0-9-_]+$/,

            _checkUrlIsAnchor: function(url) {
                return this._isAnchorRegex.test(url);
            },

            _navItemHasFocus: function() {
                // Only change focus if the user is focused inside the container already.
                // This stops the tabs stealing focus if the user is somewhere else
                // For example if the tabs are on a delay and the user is focused elsewhere it would be
                // annoying to have focus snap back to the tabs every time an item changed
                return $(document.activeElement).closest(this.container)[0] == this.container[0];
            },

            _setCurrentNav: function() {
                var self        = this;
                var opt         = this.options;
                var current     = opt.css.navCurrent;
                var navItem     = this.navItem;

                self.container.on('herotabs.show', function(event, tabs) {
                    navItem
                        .removeClass(current)
                        .find('a')
                        .each(function() {
                            this.setAttribute('aria-selected', 'false');
                            this.setAttribute('tabindex', '-1');
                        });

                    // Current nav item link
                    var navItemLink = navItem
                        .eq(tabs.currentTabIndex)
                        .addClass(current)
                        .find('a');
                    
                    navItemLink.attr({
                        'aria-selected': true,
                        'tabindex': '0'
                    });

                    if (self._navItemHasFocus()) {
                        navItemLink.focus();
                    }
                });
            }
        };

        $.fn.herotabs = function(options) {
            options = $.extend(true, {}, defaults, options);

            return this.each(function() {
                var $this = $(this);
                $this.data('herotabs', new Herotabs($this, options));
            });
        };

        $.fn.herotabs.defaults   = defaults;
        $.fn.herotabs.Herotabs   = Herotabs;
    };

    if (typeof define == 'function' && define.amd) {
        define(['jquery'], wrap);
    } else {
        wrap(global.jQuery);
    }
}(this);
