module.exports = transitionProps();

function transitionProps() {
  const prop = 'transition';
  const div = document.createElement('div');

  // Check for cool browsers first, then exit if compliant
  if (prop in div.style) {
    return {
      css: prop,
      js: 'transitionend',
    };
  }

  // Map of transitionend types.
  const transitionend = {
    transition: 'transitionend',
    webkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
  };
  const prefixes = ['Moz', 'webkit', 'O'];
  const prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);
  const props = {};

  // Try and find a matching prefix
  prefixes.forEach((prefix) => {
    const vendorProp = prefix + prop_;
    if (vendorProp in div.style) {
      props.js = transitionend[vendorProp];
      props.css = `-${prefix.toLowerCase()}-${prop}`;
    }
  });
  return props;
}
