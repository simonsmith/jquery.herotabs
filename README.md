# jQuery Herotabs

A tiny ( __1k__ gzipped ), fully accessible tab switcher for jQuery.

Useful for standard tabs and also 'hero' style tabs often found at the top of websites to display content.

## Demo
http://jsfiddle.net/Blink/cWMY9/

http://jsfiddle.net/Blink/cWMY9/show (Easier to use)


## Features
* Fade transition between tabs
* Keyboard navigation
* WAI-ARIA (via http://www.accessibleculture.org/articles/2010/08/aria-tabs/)
* Focus on tab contents
* Touch events
* Flexible HTML
* Rotate tabs with a delay

## Usage
### HTML
A simple example of markup.

```html
<div class="tabs">
    <ul class="js-nav">
        <li class="js-nav-item"><a href="#tab1">Item 1</a></li>
        <li class="js-nav-item"><a href="#tab2">Item 2</a></li>
        <li class="js-nav-item"><a href="#tab3">Item 3</a></li>
    </ul>
    <div class="js-tab" id="tab1">
        <p>content 1</p>
    </div>
    <div class="js-tab" id="tab2">
        <p>content 2</p>
    </div>
    <div class="js-tab" id="tab3">
        <p>content 3</p>
    </div>
</div>
```
Herotabs depends on classnames rather than a specific structure so feel free to nest and shuffle your HTML as necessary. [JS prefixed classnames](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/) are the default, but are not compulsory. 

The only expectation it has is that your tab navigation will be contained by an element structure like the following:

```html
<ul class="js-nav">
	<li class="js-nav-item"><a href="#tab1">Item 1</a></li>
	<li class="js-nav-item"><a href="#tab2">Item 2</a></li>
	<li class="js-nav-item"><a href="#tab3">Item 3</a></li>
</ul>

<div class="js-nav">
	<span class="js-nav-item"><a href="#tab1">Item 1</a></span>
	<span class="js-nav-item"><a href="#tab2">Item 2</a></span>
	<span class="js-nav-item"><a href="#tab3">Item 3</a></span>
</div>
```

**Note** Your navigation anchors must link to the tab content IDs (tab behaviour), or be fully-qualified URLs (follow link behaviour).

### JS

Herotabs can be used as a normal script or with an AMD compatible loader like [RequireJS](http://requirejs.org)

#### Standard way

```html
<script src="http://code.jquery.com/jquery-latest.js"></script>
<script src="jquery.herotabs.js"></script>
<script>
    $('.tabs').herotabs({
	    // options
    });
</script>    
```

#### RequireJS
Herotabs will work with RequireJS without any need for shims. Just ensure that `jquery` is set as a path.

```js
require.config({
	paths: {
		jquery: 'http://code.jquery.com/jquery-latest',
	}
});

require(['jquery', 'jquery.herotabs'], function($) {
	$('.tabs').herotabs();
});
```

## Options
* **delay** - _(number)_ How long between each tab change. If set to 0 no timed change will happen _default_ `0` 
* **duration** - _(number)_ If set to greater than zero, then this will decide how long it takes to fade transition between tabs _default_ `0`
* **startOn** - _(number)_ Index of the tab to show first _default_ `0`
* **reverse** - _(boolean)_ Will reverse display order of tabs when on a timed delay _default_ `false`
* **interactEvent** - _(string)_ Event to interact with the tab navigation. Possible values are `click` or `hover` _default_ `click`
* **useTouch** - _(boolean)_ - If the browser supports touch then Herotabs will try to use it instead of the `interactEvent` above _default_ `true`
* **useHash** - _(boolean)_ - If the page loads with a URL hash that matches a tab id then that tab will be shown first _default_ `true`
* **css** _(object)_  Classes applied to the HTML structure
	*	**active** _(string)_ - Added to the container when the plugin has setup _default_ `is-active`
	*	**current** _(string)_ - Added to the current visible tab panel _default_ `tab-current`
	* **navCurrent** _(string)_ - Added to current visible nav item _default_ `tab-nav-current`
	* **navId** _(string)_ - id to add to each nav link. Becomes `tabnav1`, `tabnav2` etc _default_ `tabnav`
* **selectors** _(object)_ - CSS selectors to grab the HTML
	* **tab** _(string)_ The tab panel containing the content _default_ `.js-tab`
	* **nav** _(string)_ The nav container _default_ `.js-nav`
	* **navItem** _(string)_ Each navigation item _default_ `.js-nav-item`
* **zIndex** _(object)_ z-index values applied to the tabs
	* **bottom** (number) Applied to all tabs _default_ `1`
	* **top** (number) Applied to the currently visible tab _default_ `2`
	
## Events
Herotabs fires various events that you can listen to. They are fired off the element that `herotabs` is instantiated  on.

```js
var $tabs = $('.tabs').herotabs();

$tabs.on('herotabs.show', function() {
    // Do something when the tab shows!
});

$tabs.on('herotabs.show', function() {
    // Do something else when the tab has shown!
});
```
### Event parameters

Every event handler receives the jQuery event object and also an object containing some useful properties:

* **currentTab** - _(jQuery object)_ The currently visible tab
* **currentTabIndex** - _(number)_ The index of the currently visible tab
* **currentNavItem** - _(jQuery object)_ The current selected nav item

```js
var $tabs = $('.tabs').herotabs();

$tabs.on('herotabs.show', function(event, tab) {
    tab.currentTab.addClass('currently-visible-tab');
    $('body').text('The current tab index is ' + tab.currentTabIndex);
    tab.currentNavItem.text('I am the current nav element');
});
```

### herotabs.show
Fired when a tab is shown

### herotabs.next
Fired when the next tab is shown

### herotabs.prev
Fired when the previous tab is shown

### herotabs.start
Fired after the tabs have begun cycling on a timed delay

### herotabs.stop
Fired after the tabs have stopped cycling
	
## Methods
You can get at the Herotabs instance by accessing it from the elements `.data` method

```js
var instance = $('.tabs').herotabs().data('herotabs');
instance.nextTab();
```

### showTab
Shows a tab. Accepts a zero based index or a jQuery element

```js
instance.showTab(2) // Index
instance.showTab($('.js-tab').eq(1)) // jQuery element
```

### nextTab
Shows the next tab. If the current tab is the last in the set it will show the first.
```js
instance.nextTab()
```

### prevTab
Shows the previous tab. If the current tab is the first in the set it will show the last.
```js
instance.prevTab()
```

### start
If a delay is set in the options, then it will begin cycling through the tabs.
```js
instance.start()
```

### stop
If the tabs are currently cycling, it will stop them
```js
instance.stop()
```

### triggerEvent
Manually invoke a Herotabs event. Accepts an event name and jQuery object/index

```js
instance.triggerEvent('herotabs.show', 2); // Use an index
instance.triggerEvent('herotabs.show', $('.a-single-tab')); // Or a jQuery object
```
Due to the events being attached after the plugin has initialised, this method might be useful if you have events that need to fire immediately or from somewhere else.

### Chaining
All methods return the instance so you can chain as many calls as you wish
```js
instance.showTab(2).nextTab().nextTab();
```

### Accessing the constructor
If for any reason you need to override or add your own methods then you can access the Herotabs prototype before initialising it.

```js
var Herotabs = $.fn.herotabs.Herotabs;
Herotabs.prototype.newMethod = function() {
    // Something new!
};

var instance = $('.tabs').herotabs().data('herotabs');
instance.newMethod();
```
## Example

```js
var $tabContainer = $('.tabs');

$tabContainer.herotabs({
    useTouch: false,
    duration: 400,
    interactEvent: 'hover',
    selectors: {
        tab: '.tab-panel',
        navItem: '.tab-nav-item',
        nav: '.tab-nav-container'
    }
});

$tabContainer.on('herotabs.show', function(event, tab) {
    tab.currentTab.text('You are looking at a tab!');
});

// The above can also be chained into one call if you're into that kind of thing
```
	
## Contributing
If you find a bug or need a feature added, please open an issue first.

### Running the tests

Check out the repo into a directory

`git clone git@github.com:simonsmith/jquery.herotabs.git`

Install the test dependencies with [Bower](http://bower.io)

`bower install --dev`

This will create a `components` directory containing Jasmine and other assets. 

Now run the `tests/index.html` page on a server. 

**Tip** On mac you can use `python -m SimpleHTTPServer`
