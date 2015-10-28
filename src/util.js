/*
 * Simple utilities and ES5 polyfills.
 * For browsers lacking native ES5 support, `es5-shim` is required.
 */
var util = module.exports = {
  /*
   * Throw an exception if `value` is not truthy.
   */
  assert: function(value, message) {
    if (!value) {
      throw new Error(message);
    }
  },

  /*
   * Simple polyfill for `Object.create`.
   * Eliminates the need to include `es5-sham` for non-ES5 browsers.
   */
  create: function(proto) {
    function Polyfill() { }
    if (Object.create) {
      return Object.create.apply(null, arguments);
    } else {
      Polyfill.prototype = proto;
      return new Polyfill();
    }
  },

  wrap: {
    /*
     * Return a function that returns `value` upon invocation if `value` is not
     * already a function.
     */
    fn: function(value) {
      if (typeof value === 'function') {
        return value;
      } else {
        return function() {
          return value;
        };
      }
    },

    /*
     * Return an array containing `value` if `value` is not already an array.
     */
    arr: function(value) {
      if (value instanceof Array) {
        return value;
      } else {
        return [value];
      }
    },
  },

  /*
   * Test whether `value` is of the specified type.
   */
  type: {
    fn: function(value) {
      return typeof value === 'function';
    },

    obj: function(value) {
      return typeof value === 'object';
    },

    str: function(value) {
      return typeof value === 'string';
    },

    regex: function(value) {
      return value instanceof RegExp;
    },

    input: function(value) {
      return value && value.nodeName === 'INPUT';
    },
  },
};

/*
 * Safely write to the `console` when `window.shibari.log` is true.
 */
util.log = {
  open: function() {
    if (console.groupCollapsed) {
      console.groupCollapsed.apply(console, arguments);
    } else {
      util.log.trace.apply(util.log, arguments);
    }
  },

  trace: function() {
    // Song and dance to avoid IE9 issues.
    // http://stackoverflow.com/a/5539378
    Function.prototype.apply.call(console.log, console, arguments);
  },

  close: function() {
    util.log.trace.apply(util.log, arguments);
    if (console.groupEnd) {
      console.groupEnd();
    }
  },
};

// Add conditional checks to each logging function.
Object.keys(util.log).forEach(function(key) {
  var fn = util.log[key];
  util.log[key] = function() {
    if (window.console && window.shibari && window.shibari.log) {
      fn.apply(this, arguments);
    }
  };
});
