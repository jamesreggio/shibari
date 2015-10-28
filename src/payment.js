var shibari = require('./format');

module.exports = {
  card: function(el) {
    return shibari.bind(el, {
      permit: /\d/,
      format: '**** **** **** ****',
    });
  },

  expiry: function(el) {
    return shibari.bind(el, {
      transform: function(next, last, mark) {
        return next
          .split('')
          .reduce(function(next, ch) {
            // Insert '0' before leading '2' through '9'.
            if (next.length === 0) {
              if (ch.match(/[2-9]/)) {
                next.unshift('0');
              }
            }
            // Insert '0' before leading '1' if followed by '/' or ' '.
            if (next.length === 1 && next[0] === '1') {
              if (ch.match(/[/\s]/)) {
                next.unshift('0');
              }
            }
            // Only permit digits and marks in the output stream.
            if (ch.match(/\d/) || ch === mark) {
              next.push(ch);
            }
            return next;
          }, [])
          .join('');
      },
      format: '** / ****',
    });
  },

  cvc: function(el) {
    return shibari.bind(el, {
      permit: /\d/,
      format: '****',
    });
  },
};
