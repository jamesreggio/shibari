/*
 * Simple polyfills for DOM transactions.
 */
module.exports = {
  /*
   * Bind an event handler.
   */
  on: function(el, name, fn) {
    if (el.addEventListener) {
      return el.addEventListener(name, fn);
    } else {
      return el.attachEvent('on' + name.toLowerCase(), fn);
    }
  },

  /*
   * Unbind an event handler.
   */
  off: function(el, name, fn) {
    if (el.removeEventListener) {
      return el.removeEventListener(name, fn);
    } else {
      return el.detachEvent('on' + name.toLowerCase(), fn);
    }
  },

  /*
   * Return the target of an event.
   */
  target: function(e) {
    return e.target || e.srcElement;
  },

  /*
   * Access a data attribute.
   */
  data: function(el, name, value) {
    var dataName;
    if (el.dataset) {
      // Set
      if (arguments.length === 3) {
        if (value == null) {
          delete el.dataset[name];
        } else {
          el.dataset[name] = value;
        }
      }
      // Get
      return el.dataset[name];
    } else {
      dataName = 'data-' + name;
      // Set
      if (arguments.length === 3) {
        if (value == null) {
          el.removeAttribute(dataName);
        } else {
          el.setAttribute(dataName, value);
        }
      }
      // Get
      return el.getAttribute(dataName);
    }
  },

  input: {
    /*
     * Access the value of an input element.
     */
    value: function(el, value) {
      // Set
      if (arguments.length === 2) {
        el.value = value;
      }
      // Get
      return el.value;
    },

    /*
     * Access the selection range of an input element.
     */
    selection: function(el, selection) {
      var index, range, inner;
      if (el.setSelectionRange) {
        // Set
        if (arguments.length === 2) {
          el.setSelectionRange.apply(el, selection);
        }
        // Get
        return [el.selectionStart, el.selectionEnd];
      } else {
        // For simplicity, this code only supports a single caret position.
        // http://stackoverflow.com/q/6943000
        // Set
        if (arguments.length === 2) {
          range = el.createTextRange();
          range.move('character', selection[0]);
          range.select();
        }
        // Get
        index = el.value.length;
        range = document.selection.createRange().duplicate();
        if (range && range.parentElement() === el) {
          inner = el.createTextRange();
          inner.moveToBookmark(range.getBookmark());
          index = -inner.moveStart('character', -el.value.length);
        }
        return [index, index];
      }
    },
  },

  /*
   * Return a simple string representation of an element.
   */
  stringify: function(el) {
    return (
      el.nodeName.toLowerCase() +
      (el.id ? ('#' + el.id) : '') +
      (el.className ? ('.' + el.className.split(' ').join('.')) : '')
    );
  },
};
