var dom = require('./dom');
var util = require('./util');

var DEFAULT_SENTINEL = '*';
var DEFAULT_MARK = '|';

/*
 * Primary formatting logic for `shibari`.
 */
var shibari = module.exports = {
  /*
   * Normalize the `options` object passed to `shibari.bind`.
   */
  normalizeOptions: function(options) {
    util.log.open('shibari.normalizeOptions', arguments);

    // Create object with `options` as prototype to prevent mutation to
    // original `options` object, which we do not own.
    options = util.create(options);

    // format: string | {value: string, sentinel?: string}
    //
    // String to use as the input format, with optional sentinel characters (or
    // string of sentinel characters) to denote which characters to replace.
    // (`*` is the default sentinel.)
    //
    // Examples (US social security number):
    //   '*** - ** - ****'
    //   {value: '___ - __ - ____', sentinel: '_'}
    //   {value: '!!! - ** - ____', sentinel: '!*_'}
    //
    // Note:
    //   The value of `format` can also be a function that returns either of
    //   the above types. The function is invoked with these arguments:
    //   (next: string, last: string)

    util.assert(
      util.type.fn(options.format) ||
      util.type.str(options.format) ||
      (util.type.obj(options.format) && util.type.str(options.format.value)),
      'shibari.bind requires options.format to be a string, function, ' +
      'or object'
    );
    options.format = util.wrap.fn(options.format);

    // permit: RegExp
    // reject: RegExp
    // transform: (next: string, last: string, mark: string) => string
    //
    // Transforms the raw input string into a string of characters to fill into
    // the format. Only one of permit, reject, or transform may be specified.
    //
    // Examples (only use digits from the raw input string):
    //   permit: /\d/g
    //   reject: \/D/g
    //   transform: see regexTransform

    function regexTransform(regex, permit) {
      return function transform(next, last, mark) {
        return next
          .split('')
          .reduce(function(next, ch) {
            var match = !!ch.match(regex);
            // Transformers must preserve mark characters in output.
            if (ch === mark) {
              next.push(ch);
            } else if ((permit && match) || (!permit && !match)) {
              next.push(ch);
            }
            return next;
          }, [])
          .join('');
      };
    }

    var transforms = 0;
    if (options.transform) {
      util.assert(
        util.type.fn(options.transform),
        'shibari.bind requires options.transform to be a function'
      );
      transforms++;
    }
    if (options.permit) {
      util.assert(
        util.type.regex(options.permit),
        'shibari.bind requires options.permit to be a RegExp'
      );
      options.transform = regexTransform(options.permit, true);
      transforms++;
    }
    if (options.reject) {
      util.assert(
        util.type.regex(options.reject),
        'shibari.bind requires options.reject to be a RegExp'
      );
      options.transform = regexTransform(options.reject, false);
      transforms++;
    }
    util.assert(
      transforms === 1,
      'shibari.bind requires only one of options.transform, options.permit, ' +
      'or options.reject'
    );

    util.log.close(options);
    return options;
  },

  /*
   * Normalize the `options.format` value passed to `shibari.bind`.
   */
  normalizeFormat: function(format) {
    util.log.open('shibari.normalizeFormat', arguments);

    //
    // Normalize `value`.
    //

    if (!util.type.obj(format)) {
      format = {
        value: format,
      };
    }

    util.assert(
      util.type.str(format.value),
      'shibari.bind requires options.format to return a format string'
    );

    // Create object with `format` as prototype to prevent mutation to original
    // `format` object, which we may not own.
    format = util.create(format);
    format.value = format.value.split('');

    //
    // Normalize `sentinel`.
    //

    format.sentinel = format.sentinel || DEFAULT_SENTINEL;
    util.assert(
      util.type.str(format.sentinel),
      'shibari.bind requires options.format to return a sentinel as string'
    );
    format.sentinel = format.sentinel.split('');

    util.log.close(format);
    return format;
  },

  /*
   * Find an available character to use as a selection marker.
   */
  findMark: function(next) {
    util.log.open('shibari.findMark', arguments);

    var mark = DEFAULT_MARK;
    while (next.indexOf(mark) !== -1) {
      mark = String.fromCharCode(mark.charCodeAt(0) + 1);
    }

    util.log.close(mark);
    return mark;
  },

  /*
   * Insert markers at the current selection bounds.
   */
  markSelection: function(next, mark, selection) {
    util.log.open('shibari.markSelection', arguments);

    next = next.substring(0, selection[0]) + mark +
           next.substring(selection[0], selection[1]) + mark +
           next.substring(selection[1]);

    util.log.close(next);
    return next;
  },

  /*
   * Transform the value into a string of characters to use in the format.
   */
  transformValue: function(next, last, mark, transform) {
    util.log.open('shibari.transformValue', arguments);

    // Transform `value`.
    next = transform(next, last, mark);

    // Validate transform.
    util.assert(
      util.type.str(next),
      'shibari.bind requires options.transform to return a string'
    );
    util.assert(
      next.split(mark).length === 3,
      'shibari.bind requires options.transform to preserve all marks'
    );

    util.log.close(next);
    return next;
  },

  /*
   * Apply the specified format to the value.
   * This is where the magic happens.
   */
  formatValue: function(next, last, selection, options) {
    util.log.open('shibari.formatValue', arguments);

    //
    // Obtain selection marker, format, and flags.
    //

    var mark = shibari.findMark(next);
    var format = shibari.normalizeFormat(options.format(next, last));
    var isGrowing = (next.length > last.length);

    //
    // Transform `next` into array of characters.
    //

    next = shibari.markSelection(next, mark, selection);
    next = shibari.transformValue(next, last, mark, options.transform);
    next = next.split('');

    // This reduction over `format.value` constructs the formatted output value
    // by substituting each `format.sentinel` character with a character from
    // the transformed value of `next`.
    //
    // format : {value: Array<string>, sentinel: Array<string>}
    // output : {value: Array<string>, selection: Array<number>, done: boolean}

    util.log.open('shibari.formatValue.loop');
    var output = format.value
      .reduce(function(output, formatChar) {
        var nextChar, hasMore;

        // If we're done, return early.
        if (output.done) {
          return output;
        }

        // Otherwise, trace this iteration.
        util.log.trace([
          output.value.join(''), output.selection, formatChar, next.join(''),
        ]);

        // If we've encountered a sentinel, try to fill from `next`.
        if (format.sentinel.indexOf(formatChar) !== -1) {
          // While we encounter a `mark`, update the selection bounds.
          while ((nextChar = next.shift()) === mark) {
            output.selection.push(output.value.length);
          }

          // If `nextChar` exists, fill it in.
          if (nextChar) {
            output.value.push(nextChar);
          }
          // If we're out of `nextChar` but we're filling placeholders, fill
          // the current `formatChar`.
          else if (options.placeholders) {
            output.value.push(formatChar);
          }
          // Otherwise, we can terminate.
          else {
            output.done = true;
          }
        }

        // Otherwise, we should pass the `formatChar` through.
        else {
          // If we're shrinking and `next[0]` is a `mark`, we've encountered
          // the position of the substring being deleted. Record the selection
          // bounds before passing the `formatChar` through.
          if (!isGrowing) {
            while (next[0] === mark) {
              output.selection.push(output.value.length);
              next.shift();
            }
          }

          // If we haven't reached the end, or we're growing or filling
          // placeholders, fill the current `formatChar`.
          hasMore = (next.length - (2 - output.selection.length)) > 0;
          if (hasMore || isGrowing || options.placeholders) {
            output.value.push(formatChar);
          }
          // Otherwise, we can terminate.
          else {
            output.done = true;
          }
        }

        return output;
      }, {
        value: [],
        selection: [],
        done: false,
      }
    );
    util.log.close([output.value.join(''), output.selection, next.join('')]);

    //
    // Include the remaining characters of `next` if we're filling overflow.
    //

    var nextChar;
    if (options.overflow) {
      util.log.open('shibari.formatValue.overflow');
      while (next.length) {
        while ((nextChar = next.shift()) === mark) {
          output.selection.push(output.value.length);
        }
        if (nextChar) {
          output.value.push(nextChar);
        }
      }
      util.log.close([output.value.join(''), output.selection]);
    }

    //
    // Finalize `output`.
    //

    output.value = output.value.join('');
    while (output.selection.length < 2) {
      output.selection.push(output.value.length);
    }
    delete output.done;

    util.log.close(output);
    return output;
  },

  /*
   * Track the document's focused element.
   * Required for downlevel compatibility.
   */
  trackCount: 0,
  trackFocus: function() {
    function inHandler(e) {
      dom.data(dom.target(e), 'focus', 'true');
    }
    function outHandler(e) {
      dom.data(dom.target(e), 'focus', null);
    }

    if (!shibari.trackCount) {
      dom.on(document, 'focusin', inHandler);
      dom.on(document, 'focusout', outHandler);

      shibari.untrackFocus = function() {
        shibari.trackCount--;
        if (!shibari.trackCount) {
          dom.off(document, 'focusin', inHandler);
          dom.off(document, 'focusout', outHandler);
        }
      };
    }
    shibari.trackCount++;
  },
  untrackFocus: function() { },

  /*
   * Bind the value of `el` to the format specified in `options`.
   * Immediately updates the value of `el` to conform to its format.
   * Returns a function that will unbind events on `el`.
   */
  bind: function(el, options) {
    util.log.open('shibari.bind', dom.stringify(el));

    //
    // Validate and normalize arguments.
    //

    util.assert(
      util.type.input(el),
      'shibari.bind requires el to be an HTMLInputElement'
    );

    util.assert(
      util.type.obj(options),
      'shibari.bind requires an options object'
    );

    options = shibari.normalizeOptions(options);

    //
    // Bind handlers.
    //

    var inHandler = false;
    function handler() {
      util.log.open('shibari.handler', dom.stringify(el));

      // Prevent re-entrancy and exit early, if possible.
      var next = dom.input.value(el);
      var last = dom.data(el, 'value');
      if (inHandler || next === last) {
        util.log.close(inHandler ? 're-entered' : 'no change');
        return;
      }
      inHandler = true;

      // Calculate format.
      var format = shibari.formatValue(
        next,
        last || '',
        dom.input.selection(el),
        options
      );

      // Update value and selection.
      dom.input.value(el, format.value);
      dom.data(el, 'value', format.value);
      dom.input.selection(el, format.selection);
      // TODO: Try select event for Firefox Mobile.

      inHandler = false;
      util.log.close();
    }

    // TODO: Verify event bubbling is correct here.
    function propertychangeHandler(e) {
      // Limit to `value` property.
      if (e.propertyName !== 'value') {
        return;
      }
      setTimeout(handler);
    }

    function selectionchangeHandler() {
      // Limit to focused `el`.
      if (dom.data(el, 'focus') !== 'true') {
        return;
      }
      setTimeout(handler);
    }

    // Feature detection.
    var hasInput = ('oninput' in document);
    var isIE = ('documentMode' in document);
    var ieVersion = document.documentMode;

    // Use `input` event, when possible.
    var unbind;
    if (hasInput && (!isIE || ieVersion > 9)) {
      dom.on(el, 'input', handler);
      unbind = function() { // jscs:ignore requireFunctionDeclarations
        dom.off(el, 'input', handler);
      };
    }
    // Otherwise, observe multiple events on IE9 and below.
    // IE9 requires `attachEvent` for `propertychange`.
    // http://bit.ly/1w4RRas
    else {
      shibari.trackFocus();
      el.attachEvent('onpropertychange', propertychangeHandler);
      dom.on(document, 'selectionchange', selectionchangeHandler);
      unbind = function() { // jscs:ignore requireFunctionDeclarations
        dom.off(document, 'selectionchange', selectionchangeHandler);
        el.detachEvent('onpropertychange', propertychangeHandler);
        shibari.untrackFocus();
      };
    }

    // Format initial value.
    handler();

    // Return function to release bindings.
    util.log.close();
    return function() {
      util.log.open('shibari.unbind', dom.stringify(el));
      unbind();
      dom.data(el, 'value', undefined);
      util.log.close();
    };
  },
};
