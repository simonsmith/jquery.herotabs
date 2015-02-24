module.exports = transitionProps();

function transitionProps() {
  'use strict';

  var prop = 'transition';
  var div = document.createElement('div');

  // Check for cool browsers first, then exit if compliant
  if (prop in div.style) {
    return {
      css: prop,
      js: 'transitionend'
    };
  }

  // Map of transitionend types.
  var transitionend = {
    'transition': 'transitionend',
    'webkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd otransitionend'
  };
  var prefixes = ['Moz', 'webkit', 'O'];
  var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);
  var props = {};

  // Try and find a matching prefix
  for (var i = 0, len = prefixes.length; i < len; ++i) {
    var vendorProp = prefixes[i] + prop_;
    if (vendorProp in div.style) {
      props.js = transitionend[vendorProp];
      props.css = '-' + prefixes[i].toLowerCase() + '-' + prop;
    }
  }

  return props;
}