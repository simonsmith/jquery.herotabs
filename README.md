# jQuery Herotabs

A tiny (less than __1k__ gzipped), fully accessible tab switcher for jQuery. 

Useful for standard tabs and also 'hero' style tabs often found at the top of websites to display content.

## Demo
http://jsfiddle.net/Blink/cWMY9/
http://jsfiddle.net/Blink/cWMY9/show (Easier to use)


## Features
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
    <div class="js-tab">
        <p>content 1</p>
    </div>
    <div class="js-tab">
        <p>content 2</p>
    </div>
    <div class="js-tab">
        <p>content 3</p>
    </div>
</div>
```
Herotabs depends on classnames rather than a specific structure so feel free to nest and shuffle your HTML as necessary. [JS prefixed classnames](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/) are the default, but are not compulsory. 

The only expectation it has is that your tab navigation will be contained by an element and that each tab `</a>` will be contained by an element. 

### JS

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
* **startOn** - _(number)_ Index of the tab to show first _default_ `0`
* **reverse** - _(boolean)_ Will reverse display order of tabs when on a timed delay _default_ `false`
* **interactEvent** - _(string)_ Event to interact with the tab navigation. Possible values are `click` or `hover` _default_ `click`
* **useTouch** - _(boolean)_ - If the browser supports touch then Herotabs will try to use it instead of the `interactEvent` above _default_ `true`
* **css** _(object)_  Classes applied to the HTML structure
	*	**active** _(string)_ - Added to the container when the plugin has setup _default_ `is-active`
	*	**current** _(string)_ - Added to the current visible tab panel _default_ `tab-current`
	* **navCurrent** _(string)_ - Added to current visible nav item _default_ `tab-nav-current`
	* **navId** _(string)_ - id to add to each nav link. Becomes `tabnav1`, `tabnav2` etc _default_ `tabnav`
* **selectors** _(object)_ - CSS selectors to grab the HTML
	* **tab** _(string)_ The tab panel containing the content _default_ `.js-tab`
	* **nav** _(string)_ The nav container _default_ `.js-nav`
	* **navItem** _(string)_ Each navigation item _default_ `.js-nav-item`
	
## Methods
You can get at the Herotabs instance by accessing it from the elements `.data` method

```js
var tabs = $('.tabs').herotabs().data('herotabs');
tabs.nextTab();
```

### showTab
Shows a tab. Accepts an element index or a jQuery element

```js
tabs.showTab(2) // Index
tabs.showTab($('.js-tab').eq(1)) // jQuery element
```

### nextTab
Shows the next tab. If the current tab is the last in the set it will show the first.
```js
tabs.nextTab()
```

### prevTab
Shows the previous tab. If the current tab is the first in the set it will show the last.
```js
tabs.prevTab()
```

### start
If a delay is set in the options, then it will begin cycling through the tabs.
```js
tabs.start()
```

###stop
If the tabs are currently cycling, it will stop them
```js
tabs.stop()
```

#### Chaining
All methods return the instance so you can chain as many calls as you wish
```js
tabs.showTab(2).nextTab().nextTab();
```

## Events
Herotabs uses custom events. They are fired off the element that `herotabs` is instantiated  on.
```js
var tabs = $('.tabs').herotabs();
tabs.on('herotabs.next', function() {
	// Do something!
})
```

### herotabs.show
Fired when a tab is shown

Receives an object containing the current tab

```js
$('.tabs').herotabs().on('herotabs.show', function(event, data) {
	data.current.text('I am the current tab!');
})
```

### herotabs.next
Fired when the next tab is shown

Receives an object containing the current visible tab before the event was fired and the next tab that will be visible.

```js
$('.tabs').herotabs().on('herotabs.next', function(event, data) {
	data.current.text('I am the tab that was visible before the event was fired!');
	data.next.text('I am the next tab and am now visible!')
})
```

### herotabs.prev
Fired when the previous tab is shown

Receives an object containing the current visible tab before the event was fired and the previous tab that will be visible.

```js
$('.tabs').herotabs().on('herotabs.next', function(event, data) {
	data.current.text('I am the tab that was visible before the event was fired!');
	data.prev.text('I am the previous tab and am now visible!')
})
```

### herotabs.beforeStart
Fired before the tabs begin cycling on a timed delay

Receives an object containing the current tab

```js
$('.tabs').herotabs().on('herotabs.beforeStart', function(event, data) {
	data.current.text('I am the current tab!');
})
```

### herotabs.start
Fired after the tabs have begun cycling on a timed delay

Receives an object containing the current tab

```js
$('.tabs').herotabs().on('herotabs.start', function(event, data) {
	data.current.text('I am the current tab!');
})
```

### herotabs.beforeStop
Fired before the tabs stop cycling on a timed delay

Receives an object containing the current tab

```js
$('.tabs').herotabs().on('herotabs.beforeStop', function(event, data) {
	data.current.text('I am the current tab!');
})
```

### herotabs.stop
Fired after the tabs have stopped cycling

Receives an object containing the current tab

```js
$('.tabs').herotabs().on('herotabs.stop', function(event, data) {
	data.current.text('I am the current tab!');
})
```
	
## Contributing
If you find a bug or need a feature added, please open an issue first.


