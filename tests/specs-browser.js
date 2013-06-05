describe('Herotabs', function() {

    describe('Basic HTML', function() {
        testSuite('basic.html');
    });

    describe('Heavily nested HTML', function() {
        testSuite('nesting.html');
    });

    describe('Mixed HTML elements', function() {
        testSuite('mixed-elements.html');
    });

    function testSuite(fixture) {
        var tabs, nav, tabPanels, instance;

        describe('Object init', function() {
            beforeEach(function() {
                loadFixtures(fixture);
                tabs = $('.tabs').herotabs({
                    interactEvent: 'hover',
                    css: {
                        navId: 'test'
                    }
                });
                instance = tabs.data('herotabs');
            });

            it('should expose the constructor', function() {
                expect($.fn.herotabs.Herotabs).toBeOfType('function');
            });

            it('should create an instance in data storage', function() {
                expect(instance.constructor).toEqual($.fn.herotabs.Herotabs);
            });

            it('should expose default options', function() {
                expect($.fn.herotabs.defaults).toBeOfType('object');
            });

            it('should allow user to override default options', function() {
                expect(instance.options.interactEvent).toBe('hover');
                expect(instance.options.css.navId).toBe('test');
                expect(instance.options.css.current).toBe('tab-current');
            });

            it('should set an active class', function() {
                expect(tabs).toHaveClass($.fn.herotabs.defaults.css.active);
            });
        });

        beforeEach(function() {
            loadFixtures(fixture);
            tabs = $('.tabs').herotabs();
            nav = $('.js-nav');
            tabPanels = $('.js-tab');
            instance = tabs.data('herotabs');
        });

        describe('Initial nav state', function() {
            it('should set roles on the navigation', function() {
                expect(nav).toHaveAttr('role', 'tablist');
                expect(nav.find('.js-nav-item')).toHaveAttr('role', 'presentation');
                expect(nav.find('.js-nav-item a')).toHaveAttr('role', 'tab');
            });

            it('should generate ids on the nav links', function() {
                nav.find('a').each(function(index) {
                    expect($(this)).toHaveId($.fn.herotabs.defaults.css.navId + (index + 1));
                });
            });

            it('should set the first nav item to current by default', function() {
                expect(nav.find('.js-nav-item').eq(0)).toHaveClass($.fn.herotabs.defaults.css.navCurrent);
                expect(nav.find('a').eq(0)).toHaveAttr('aria-selected', 'true');
                expect(nav.find('a').eq(0)).toHaveAttr('tabindex', '0');

                expect(nav.find('.js-nav-item').slice(1)).not.toHaveClass($.fn.herotabs.defaults.css.navCurrent);
                expect(nav.find('a').slice(1)).toHaveAttr('tabindex', '-1');
                expect(nav.find('a').slice(1)).toHaveAttr('aria-selected', 'false');
            });
        });

        describe('Initial tab panel state', function() {
            it('should set roles on the tab panels', function() {
                expect(tabPanels).toHaveAttr('role', 'tabpanel');
            });

            it('should link tab panels to their nav item ids', function() {
                tabPanels.each(function(index) {
                    expect($(this)).toHaveAttr('aria-labelledby', $.fn.herotabs.defaults.css.navId + (index + 1));
                });
            });

            it('should set the first tab panel to current by default', function() {
                expect(tabPanels.eq(0)).toHaveClass($.fn.herotabs.defaults.css.current);
                expect(tabPanels.eq(0)).toHaveAttr('aria-hidden', 'false');
                expect(tabPanels.eq(0)).toHaveAttr('tabindex', '0');
                expect(tabPanels.eq(0)).toBeVisible();

                expect(tabPanels.slice(1)).toHaveAttr('aria-hidden', 'true');
                expect(tabPanels.slice(1)).toHaveAttr('tabindex', '-1');
                expect(tabPanels.slice(1)).toBeHidden();
            });

            it('should set correct tabindex to links within the tab panels', function() {
                expect(tabPanels.eq(0).find('a')).toHaveAttr('tabindex', '0');
                expect(tabPanels.slice(1).find('a')).toHaveAttr('tabindex', '-1');
            });
        });

        describe('Show tab', function() {
            it('should show the selected tab by using an index', function() {
                instance.showTab(1);

                expect(tabPanels.eq(0)).toBeHidden();
                expect(tabPanels.eq(0)).not.toHaveClass($.fn.herotabs.defaults.css.current);

                expect(tabPanels.eq(1)).toBeVisible();
                expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should show the selected tab by using an jQuery object of the element', function() {
                instance.showTab(tabPanels.eq(1));

                expect(tabPanels.eq(0)).toBeHidden();
                expect(tabPanels.eq(0)).not.toHaveClass($.fn.herotabs.defaults.css.current);

                expect(tabPanels.eq(1)).toBeVisible();
                expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should do nothing if an index is greater than the total elements', function() {
                instance.showTab(5);

                expect(tabPanels.eq(0)).toBeVisible();
                expect(tabPanels.eq(0)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should return the instance', function() {
                var ret = instance.showTab(2);
                expect(ret.constructor).toEqual($.fn.herotabs.Herotabs);
            });
        });

        describe('Next tab', function() {
            it('should show the next tab', function() {
                instance.nextTab();

                expect(tabPanels.eq(0)).toBeHidden();
                expect(tabPanels.eq(0)).not.toHaveClass($.fn.herotabs.defaults.css.current);

                expect(tabPanels.eq(1)).toBeVisible();
                expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should show the first tab if the last one is already visible', function() {
                instance.showTab(2);
                instance.nextTab();

                expect(tabPanels.eq(2)).toBeHidden();
                expect(tabPanels.eq(2)).not.toHaveClass($.fn.herotabs.defaults.css.current);

                expect(tabPanels.eq(0)).toBeVisible();
                expect(tabPanels.eq(0)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should return the instance', function() {
                var ret = instance.nextTab();
                expect(ret.constructor).toEqual($.fn.herotabs.Herotabs);
            });
        });

        describe('Previous tab', function() {
            it('should show the previous tab', function() {
                instance.prevTab();

                expect(tabPanels.eq(0)).toBeHidden();
                expect(tabPanels.eq(0)).not.toHaveClass($.fn.herotabs.defaults.css.current);

                expect(tabPanels.eq(2)).toBeVisible();
                expect(tabPanels.eq(2)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should return the instance', function() {
                var ret = instance.nextTab();
                expect(ret.constructor).toEqual($.fn.herotabs.Herotabs);
            });
        });

        describe('Timer', function() {
            it('should show the next tab after the delay', function() {
                var done = false;
                tabs = $('.tabs').herotabs({
                    delay: 300
                });

                runs(function() {
                    setTimeout(function() {
                        done = true;
                    }, 300);
                });

                waitsFor(function() {
                    return done;
                }, "The next tab should be visible", 600);

                runs(function() {
                    expect(tabPanels.eq(0)).toBeHidden();
                    expect(tabPanels.eq(0)).not.toHaveClass($.fn.herotabs.defaults.css.current);

                    expect(tabPanels.eq(1)).toBeVisible();
                    expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
                });
            });

            it('should show the previous tab if reverse is set', function() {
                var done = false;
                tabs = $('.tabs').herotabs({
                    delay: 300,
                    reverse: true
                });

                runs(function() {
                    setTimeout(function() {
                        done = true;
                    }, 300);
                });

                waitsFor(function() {
                    return done;
                }, "The previous tab should be visible", 600);

                runs(function() {
                    expect(tabPanels.eq(0)).toBeHidden();
                    expect(tabPanels.eq(0)).not.toHaveClass($.fn.herotabs.defaults.css.current);

                    expect(tabPanels.eq(2)).toBeVisible();
                    expect(tabPanels.eq(2)).toHaveClass($.fn.herotabs.defaults.css.current);
                });
            });

            it('should allow the timer to be stopped', function() {
                var done = false;
                tabs = $('.tabs').herotabs({
                    delay: 500
                });
                instance = tabs.data('herotabs');

                runs(function() {
                    setTimeout(function() {
                        done = true;
                        instance.stop();
                    }, 300);
                });

                waitsFor(function() {
                    return done;
                }, "The first tab should still be visible", 400);

                runs(function() {
                    expect(tabPanels.eq(0)).toBeVisible();
                    expect(tabPanels.eq(0)).toHaveClass($.fn.herotabs.defaults.css.current);
                });
            });
        });

        describe('Custom events', function() {
            it('should fire an event when a tab is shown', function() {
                spyOnEvent(tabs, 'herotabs.show');
                instance.showTab(1);
                expect('herotabs.show').toHaveBeenTriggeredOn(tabs);
            });

            it('should fire an event when the next tab is shown', function() {
                spyOnEvent(tabs, 'herotabs.next');
                instance.nextTab();
                expect('herotabs.next').toHaveBeenTriggeredOn(tabs);
            });

            it('should fire an event when the previous tab is shown', function() {
                spyOnEvent(tabs, 'herotabs.prev');
                instance.prevTab();
                expect('herotabs.prev').toHaveBeenTriggeredOn(tabs);
            });

            it('should fire events when the start method is called', function() {
                spyOnEvent(tabs, 'herotabs.start');
                spyOnEvent(tabs, 'herotabs.beforeStart');

                instance.options.delay = 200;
                instance.start();

                expect('herotabs.beforeStart').toHaveBeenTriggeredOn(tabs);
                expect('herotabs.start').toHaveBeenTriggeredOn(tabs);
            });

            it('should fire events when the stop method is called', function() {
                spyOnEvent(tabs, 'herotabs.beforeStop');
                spyOnEvent(tabs, 'herotabs.stop');

                instance.options.delay = 200;
                instance.start();
                instance.stop();

                expect('herotabs.beforeStop').toHaveBeenTriggeredOn(tabs);
                expect('herotabs.stop').toHaveBeenTriggeredOn(tabs);
            });
        });

        describe('Browser events', function() {
            it('should change tab when a nav item is clicked', function() {
                var event = $.Event('click');
                event.target = nav.find('a')[1];
                nav.trigger(event);

                expect(tabPanels.eq(1)).toBeVisible();
                expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should change tab when a nav item is hovered', function() {
                tabs = $('.tabs').herotabs({
                    interactEvent: 'hover'
                });
                var event = $.Event('mouseenter');
                event.target = nav.find('a')[1];
                nav.trigger(event);

                expect(tabPanels.eq(1)).toBeVisible();
                expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should show next tab when the right arrow is pressed', function() {
                var event = $.Event('keydown');
                event.target = nav.find('a')[1];
                event.keyCode = 39;
                nav.trigger(event);

                expect(tabPanels.eq(1)).toBeVisible();
                expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should show next tab when the down arrow is pressed', function() {
                var event = $.Event('keydown');
                event.target = nav.find('a')[1];
                event.keyCode = 40;
                nav.trigger(event);

                expect(tabPanels.eq(1)).toBeVisible();
                expect(tabPanels.eq(1)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should show previous tab when the left arrow is pressed', function() {
                var event = $.Event('keydown');
                event.target = nav.find('a')[1];
                event.keyCode = 37;
                nav.trigger(event);

                expect(tabPanels.eq(2)).toBeVisible();
                expect(tabPanels.eq(2)).toHaveClass($.fn.herotabs.defaults.css.current);
            });

            it('should show previous tab when the up arrow is pressed', function() {
                var event = $.Event('keydown');
                event.target = nav.find('a')[1];
                event.keyCode = 38;
                nav.trigger(event);

                expect(tabPanels.eq(2)).toBeVisible();
                expect(tabPanels.eq(2)).toHaveClass($.fn.herotabs.defaults.css.current);
            });
        });

        describe('checkUrlIsAnchor regex', function() {
            it('should match hrefs that are anchor links', function() {
                expect(instance._checkUrlIsAnchor('#href')).toBeTruthy();
                expect(instance._checkUrlIsAnchor('#href_foo')).toBeTruthy();
                expect(instance._checkUrlIsAnchor('#href-foo')).toBeTruthy();
                expect(instance._checkUrlIsAnchor('#hREffoo')).toBeTruthy();
                expect(instance._checkUrlIsAnchor('/#hREffoo')).toBeTruthy();

                expect(instance._checkUrlIsAnchor('http://google.com')).toBeFalsy();
                expect(instance._checkUrlIsAnchor('fooo')).toBeFalsy();
                expect(instance._checkUrlIsAnchor('')).toBeFalsy();
            });
        });
    }

});






