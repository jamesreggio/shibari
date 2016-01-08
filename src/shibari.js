// TODO: IE9 paste causes caret to move to end.
// TODO: IE9 total deletion (CTRL-A + BKSP) doesn't reformat.
// TODO: Cleanup bindings and review `shibari.bind`.
// TODO: Fix mobile Firefox.
// TODO: IME support.

var format = require('./format');
var payment = require('./payment');

/*
 * Public interface for `shibari`.
 * For browsers lacking native ES5 support, `es5-shim` is required.
 */
module.exports = {
  bind: format.bind,

  // TODO: Remove.
  payment: payment,
  log: true,
};
