/** @cc_on
 * jquery.herotabs-animate
 * Enables fade effect via .animate() for older browsers
 * https://github.com/simonsmith/jquery.herotabs
 */

!function($) {
    var proto = $.fn.herotabs.Herotabs.prototype;

    // Browsers without transition support will return undefined
    if (typeof proto._transitionProps.css == 'string') {
        return;
    }

    proto.showTab = function(tabToShow) {
        tabToShow = this._getTab(tabToShow);

        var currentTab = this._currentTab;
        var opt = this.options;

        // Exit if there is no tab to show or the same one
        // is already showing
        if (tabToShow.length == 0 || currentTab.is(tabToShow)) {
            return this;
        }

        // Quit any running animations first
        this.tab.stop(true, true);

        // The next tab to be shown needs position: absolute to allow
        // it to be under the current tab as it begins animation. Once the current tab
        // has finished animating the next tab will have position: relative reapplied
        // so it maintains the height of the herotabs in the DOM.
        tabToShow
            .show()
            .css({
                'position': 'absolute',
                'opacity': 1
            });

        // Animate the current tab and set visibility when
        // the animation has completed
        var self = this;
        currentTab.animate({ opacity: 0 }, opt.duration, function() {
            self._setTabVisibilty(tabToShow, currentTab);
        });

        // Trigger event outside of .animate()
        // Allows user to use keyboard navigation and skip a tab
        // without waiting for animations to finish
        this.triggerEvent('herotabs.show', tabToShow);

        // Update reference to the current tab
        this._currentTab = tabToShow;

        return this;
    }
}(jQuery);
