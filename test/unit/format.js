var expect = require('chai').expect;
var shibari = require('../../src/format');
var util = require('../../src/util');

function clone(obj) {
  var clone = {};
  for (var key in obj) {
    clone[key] = obj[key];
  }
  return clone;
}

describe('shibari', function() {
  describe('normalizeOptions', function() {
    it('does not mutate the original object', function() {
      var options = {
        permit: /\d/,
        format: '**** **** **** ****',
      };
      var original = clone(options);
      var normalized = shibari.normalizeOptions(options);
      expect(normalized).to.not.equal(options);
      expect(options).to.deep.equal(original);
    });

    it('validates the format', function() {
      expect(function() {
        shibari.normalizeOptions({
          permit: /\d/,
          // `format` missing.
        });
      }).to.throw('options.format');

      expect(function() {
        shibari.normalizeOptions({
          permit: /\d/,
          format: /\d/, // Incorrect type.
        });
      }).to.throw('options.format');

      expect(function() {
        shibari.normalizeOptions({
          permit: /\d/,
          format: '**** **** **** ****',
        });
      }).not.to.throw;

      expect(function() {
        shibari.normalizeOptions({
          permit: /\d/,
          format: function() { },
        });
      }).not.to.throw;

      expect(function() {
        shibari.normalizeOptions({
          permit: /\d/,
          format: {
            // `value` missing.
          },
        });
      }).to.throw('options.format');

      expect(function() {
        shibari.normalizeOptions({
          permit: /\d/,
          format: {
            value: /\d/, // Incorrect type.
          },
        });
      }).to.throw('options.format');

      expect(function() {
        shibari.normalizeOptions({
          permit: /\d/,
          format: {
            value: '**** **** **** ****',
          },
        });
      }).not.to.throw;
    });

    it('validates the transform', function() {
      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          // Transform missing.
        });
      }).to.throw('options.transform');

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          transform: /\d/, // Incorrect type.
        });
      }).to.throw('options.transform');

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          transform: function() { },
        });
      }).not.to.throw;

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          permit: function() { }, // Incorrect type.
        });
      }).to.throw('options.permit');

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          permit: /\d/,
        });
      }).not.to.throw;

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          reject: function() { }, // Incorrect type.
        });
      }).to.throw('options.reject');

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          reject: /\D/,
        });
      }).not.to.throw;

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          // Too many transformers.
          permit: /\d/,
          reject: /\D/,
        });
      }).to.throw('options.transform');

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          // Too many transformers.
          transform: function() { },
          permit: /\d/,
          reject: /\D/,
        });
      }).to.throw('options.transform');

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          // Too many transformers.
          transform: function() { },
          permit: /\d/,
        });
      }).to.throw('options.transform');

      expect(function() {
        shibari.normalizeOptions({
          format: '**** **** **** ****',
          // Too many transformers.
          transform: function() { },
          reject: /\D/,
        });
      }).to.throw('options.transform');
    });

    it('returns an object with the correct keys', function() {
      var tests = [
        {
          format: '**** **** **** ****',
          transform: function() { },
        },
        {
          format: {
            value: '**** **** **** ****',
          },
          transform: function() { },
        },
        {
          format: function() { },
          transform: function() { },
        },
        {
          format: function() { },
          permit: /\d/,
        },
        {
          format: function() { },
          reject: /\D/,
        },
      ];

      tests.forEach(function(test) {
        var options = shibari.normalizeOptions(test);
        expect(options.format).to.be.a.function;
        expect(options.transform).to.be.a.function;
        if (util.type.fn(test.format)) {
          expect(options.format).to.equal(test.format);
        } else {
          expect(options.format()).to.equal(test.format);
        }
        if (util.type.fn(test.transform)) {
          expect(options.transform).to.equal(test.transform);
        }
      });
    });

    describe('regexTransformer', function() {
      var tests = {
        '': '',
        '||': '||',
        '123': '123',
        '|123|': '|123|',
        '||123': '||123',
        '123||': '123||',
        'abc': '',
        'a|b|c': '||',
        'a1b2c3': '123',
        'a1|b2|c3': '1|2|3',
      };

      function validate(transform) {
        Object.keys(tests).forEach(function(test) {
          expect(transform(test, '', '|')).to.equal(tests[test]);
        });
      };

      it('supplies a valid tranformer for permit', function() {
        var options = shibari.normalizeOptions({
          format: '**** **** **** ****',
          permit: /\d/,
        });
        validate(options.transform);
      });

      it('supplies a valid tranformer for reject', function() {
        var options = shibari.normalizeOptions({
          format: '**** **** **** ****',
          reject: /\D/,
        });
        validate(options.transform);
      });
    });
  });

  describe('normalizeFormat', function() {
    it('does not mutate the original object', function() {
      var format = {
        value: '**** **** **** ****',
      };
      var original = clone(format);
      var normalized = shibari.normalizeFormat(format);
      expect(normalized).to.not.equal(format);
      expect(format).to.deep.equal(original);
    });

    it('validates the value', function() {
      expect(function() {
        shibari.normalizeFormat(/\d/); // Incorrect type.
      }).to.throw('format');

      expect(function() {
        shibari.normalizeFormat({
          // `value` missing.
        });
      }).to.throw('format');

      expect(function() {
        shibari.normalizeFormat('**** **** **** ****');
      }).not.to.throw;

      expect(function() {
        shibari.normalizeFormat({
          value: /\d/, // Incorrect type.
        });
      }).to.throw('format');

      expect(function() {
        shibari.normalizeFormat({
          value: '**** **** **** ****',
        });
      }).not.to.throw;
    });

    it('validates the sentinel', function() {
      expect(function() {
        shibari.normalizeFormat({
          value: '**** **** **** ****',
          sentinel: /\d/, // Incorrect type.
        });
      }).to.throw('sentinel');

      expect(function() {
        shibari.normalizeFormat({
          value: '**** **** **** ****',
          sentinel: '*',
        });
      }).not.to.throw;
    });

    it('returns an object with the correct keys', function() {
      var tests = [
        '**** **** **** ****',
        {
          value: '**** **** **** ****',
        },
        {
          value: '**** **** **** ****',
          sentinel: '*',
        },
        {
          value: '**** **** **** ****',
          sentinel: '*|',
        },
      ];

      tests.forEach(function(test) {
        var format = shibari.normalizeFormat(test);
        expect(format.value).to.be.an.array;
        expect(format.sentinel).to.be.an.array;
        if (util.type.str(test)) {
          expect(format.value).to.deep.equal(test.split(''));
          expect(format.sentinel).to.deep.equal(['*']);
        } else if (!util.type.str(test.sentinel)) {
          expect(format.value).to.deep.equal(test.value.split(''));
          expect(format.sentinel).to.deep.equal(['*']);
        } else {
          expect(format.value).to.deep.equal(test.value.split(''));
          expect(format.sentinel).to.deep.equal(test.sentinel.split(''));
        }
      });
    });
  });

  describe('findMark', function() {
    it('returns a single character', function() {
      var mark = shibari.findMark('abc123$%^');
      expect(mark).to.be.a.string;
      expect(mark.length).to.equal(1);
    });

    it('does not use a character from the input', function() {
      var input = '|}~a';
      var mark = shibari.findMark(input);
      expect(input.indexOf(mark)).to.equal(-1);
    });
  });

  describe('markSelection', function() {
    it('inserts markers at the current selection bounds', function() {
      var mark = '|';
      var selection = [3, 6];
      var input = 'abc123def456';
      var marked = shibari.markSelection(input, mark, selection);
      var arr = marked.split('');
      expect(arr.length).to.equal(input.length + 2);
      expect(arr[selection[0]]).to.equal(mark);
      expect(arr[selection[1] + 1]).to.equal(mark);
    });
  });

  describe('transformValue', function() {
    it('validates the transformer returns a string', function() {
      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return /\d/;
          }
        );
      }).to.throw('string');

      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return '|value|'.split('');
          }
        );
      }).to.throw('string');

      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return '|value|';
          }
        );
      }).not.to.throw;
    });

    it('validates the transformer preserves all marks', function() {
      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return 'value';
          }
        );
      }).to.throw('marks');

      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return 'value|';
          }
        );
      }).to.throw('marks');

      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return '|value|';
          }
        );
      }).not.to.throw;

      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return 'value||';
          }
        );
      }).not.to.throw;

      expect(function() {
        shibari.transformValue('next', 'last', '|',
          function(next, last, mark) {
            return 'value|||';
          }
        );
      }).to.throw('marks');
    });

    it('supplies the given arguments to the transformer', function() {
      shibari.transformValue('next', 'last', '|', function(next, last, mark) {
        expect(next).to.equal('next');
        expect(last).to.equal('last');
        expect(mark).to.equal('|');
        return '|value|';
      });
    });

    it('returns the value from the transformer', function() {
      var value = shibari.transformValue('next', 'last', '|',
        function(next, last, mark) {
          return '|value|';
        }
      );
      expect(value).to.equal('|value|');
    });
  });

  describe('formatValue', function() {
    it('supplies the given arguments to the formatter', function() {
      shibari.formatValue('next', 'last', [0, 0], shibari.normalizeOptions({
        permit: /\d/,
        format: function(next, last) {
          expect(next).to.equal('next');
          expect(last).to.equal('last');
          return '**** **** **** ****';
        },
      }));
    });

    it('returns an object with the correct keys', function() {
      var obj = shibari.formatValue(
        '1a2b3c', '', [0, 0], shibari.normalizeOptions({
          permit: /\d/,
          format: '* * *',
        })
      );
      expect(obj.value).to.be.a.string;
      expect(obj.selection).to.be.an.array;
      expect(obj.selection.length).to.equal(2);
    });

    describe('sentinels', function() {
      it("uses '*' as the default sentinel", function() {
        var obj = shibari.formatValue(
          '1a2b3c', '', [0, 0], shibari.normalizeOptions({
            permit: /\d/,
            format: '* * *',
          })
        );
        expect(obj.value).to.equal('1 2 3');
      });

      it('uses the supplied sentinel', function() {
        var obj = shibari.formatValue(
          '1a2b3c', '', [0, 0], shibari.normalizeOptions({
            permit: /\d/,
            format: {
              value: '! ! !',
              sentinel: '!',
            },
          })
        );
        expect(obj.value).to.equal('1 2 3');
      });

      it('supports multiple sentinels', function() {
        var obj = shibari.formatValue(
          '1a2b3c', '', [0, 0], shibari.normalizeOptions({
            permit: /\d/,
            format: {
              value: '! < >',
              sentinel: '!<>',
            },
          })
        );
        expect(obj.value).to.equal('1 2 3');
      });
    });

    // Simple input/output unit tests for a variety of special `options`.
    describe('options', function() {
      function str2sel(str) {
        var str = str.split('|');
        return {
          value: str.join(''),
          selection: [str[0].length, str[0].length + str[1].length],
        };
      }

      function sel2str(obj) {
        return shibari.markSelection(obj.value, '|', obj.selection);
      }

      function validate(tests, options) {
        tests.forEach(function(test, i) {
          var obj = str2sel(test[0]);
          var next = obj.value;
          var selection = obj.selection;
          var last = (i > 0) ? str2sel(tests[i - 1][1]).value : '';
          obj = shibari.formatValue(
            next, last, selection, shibari.normalizeOptions(options)
          );
          expect(sel2str(obj)).to.equal(test[1], "input '" + test[0] + "'");
        });
      }

      it('returns the correct value for simple options', function() {
        var tests = [
          // Selection at end.
          ['||', '||'],
          ['a||', '||'],
          ['1||', '1||'],
          ['1a||', '1||'],
          ['1a2b3c||', '123||'],

          // Selection at beginning.
          ['||', '||'],
          ['||a', '||'],
          ['||1', '||1'],
          ['||a1', '||1'],

          // Selection at end, growing with format characters.
          ['||', '||'],
          ['1||', '1||'],
          ['12||', '12||'],
          ['123||', '123||'],
          ['1234||', '1234 ||'],
          ['1234 5||', '1234 5||'],
          ['1234 56||', '1234 56||'],
          ['1234 56ab cdef gh||', '1234 56||'],

          // Selection at end, shrinking with format characters.
          ['1234 5||', '1234 5||'],
          ['1234 ||', '1234||'],
          ['123||', '123||'],
          ['12||', '12||'],
          ['1||', '1||'],
          ['||', '||'],

          // Selection at format character, receiving rejected input.
          ['||', '||'],
          ['1234||', '1234 ||'],
          ['1234a|| ', '1234 ||'],
          ['1234 a||', '1234 ||'],

          // Selection split, growing with format characters.
          ['||', '||'],
          ['1|2|3', '1|2|3'],
          ['1|23|4', '1|23|4 '],
          ['1|23|45', '1|23|4 5'],

          ['||', '||'],
          ['1|23|', '1|23|'],
          ['1|234|', '1|234 |'],
          ['1|234 |5', '1|234 |5'],

          // Selection split, shrinking with format characters.
          ['1234| 5|', '1234| 5|'],
          ['1234| |', '1234||'],

          // Selection joined in middle, growing with format characters.
          ['||', '||'],
          ['1234|| 56', '1234 ||56'],
          ['12349|| 56', '1234 9||56'],
          ['1238||4 956', '1238 ||4956 '],

          // Selection joining in middle, shrinking with format characters.
          ['1238 4||956 7', '1238 4||956 7'],
          ['1238 ||956 7', '1238|| 9567'],
          ['123|| 9567', '123||9 567'],
        ];

        validate(tests, {
          format: '**** **** **** ****',
          permit: /\d/,
        });
      });

      it('returns the correct value when filling placeholders', function() {
        var tests = [
          // Selection at end.
          ['||**** **** **** ****', '||**** **** **** ****'],
          ['a||**** **** **** ****', '||**** **** **** ****'],
          ['1||**** **** **** ****', '1||*** **** **** ****'],
          ['1a||*** **** **** ****', '1||*** **** **** ****'],
          ['1a2b3c||*** **** **** ****', '123||* **** **** ****'],

          // Selection at beginning.
          ['||**** **** **** ****', '||**** **** **** ****'],
          ['||a**** **** **** ****', '||**** **** **** ****'],
          ['||1**** **** **** ****', '||1*** **** **** ****'],
          ['||a1*** **** **** ****', '||1*** **** **** ****'],

          // Selection at end, growing with format characters.
          ['||**** **** **** ****', '||**** **** **** ****'],
          ['1||**** **** **** ****', '1||*** **** **** ****'],
          ['12||*** **** **** ****', '12||** **** **** ****'],
          ['123||** **** **** ****', '123||* **** **** ****'],
          ['1234||* **** **** ****', '1234 ||**** **** ****'],
          ['1234 5||**** **** ****', '1234 5||*** **** ****'],
          ['1234 56||*** **** ****', '1234 56||** **** ****'],
          ['1234 56ab cdef gh||** **** ****', '1234 56||** **** ****'],

          // Selection at end, shrinking with format characters.
          ['1234 5||*** **** ****', '1234 5||*** **** ****'],
          ['1234 ||*** **** ****', '1234|| **** **** ****'],
          ['123|| **** **** ****', '123||* **** **** ****'],
          ['12||* **** **** ****', '12||** **** **** ****'],
          ['1||** **** **** ****', '1||*** **** **** ****'],
          ['||*** **** **** ****', '||**** **** **** ****'],

          // Selection at format character, receiving rejected input.
          ['||**** **** **** ****', '||**** **** **** ****'],
          ['1234||**** **** **** ****', '1234 ||**** **** ****'],
          ['1234a|| **** **** ****', '1234 ||**** **** ****'],
          ['1234 a||**** **** ****', '1234 ||**** **** ****'],

          // Selection split, growing with format characters.
          ['||**** **** **** ****', '||**** **** **** ****'],
          ['1|2|3**** **** **** ****', '1|2|3* **** **** ****'],
          ['1|23|4* **** **** ****', '1|23|4 **** **** ****'],
          ['1|23|45 **** **** ****', '1|23|4 5*** **** ****'],

          ['||**** **** **** ****', '||**** **** **** ****'],
          ['1|23|**** **** **** ****', '1|23|* **** **** ****'],
          ['1|234|* **** **** ****', '1|234 |**** **** ****'],
          ['1|234 |5**** **** ****', '1|234 |5*** **** ****'],

          // Selection split, shrinking with format characters.
          ['1234| 5|*** **** ****', '1234| 5|*** **** ****'],
          ['1234| |*** **** ****', '1234|| **** **** ****'],

          // Selection joined in middle, growing with format characters.
          ['||**** **** **** ****', '||**** **** **** ****'],
          ['1234|| 56**** **** **** ****', '1234 ||56** **** ****'],
          ['12349|| 56** **** ****', '1234 9||56* **** ****'],
          ['1238||4 956* **** ****', '1238 ||4956 **** ****'],

          // Selection joining in middle, shrinking with format characters.
          ['1238 4||956 7*** ****', '1238 4||956 7*** ****'],
          ['1238 ||956 7*** ****', '1238|| 9567 **** ****'],
          ['123|| 9567 **** ****', '123||9 567* **** ****'],
        ];

        validate(tests, {
          format: '**** **** **** ****',
          permit: /\d/,
          placeholders: true,
        });
      });

      it('returns the correct value when allowing overflow', function() {
        var tests = [
          // Overflow with permitted characters.
          ['1234 1234 1234 1234||', '1234 1234 1234 1234||'],
          ['1234 1234 1234 12349||', '1234 1234 1234 12349||'],
          ['1234 1234 1234 123498||', '1234 1234 1234 123498||'],
          ['1234 1234 1234 1234987||', '1234 1234 1234 1234987||'],
          ['1234 1234 1234 12349876||', '1234 1234 1234 12349876||'],
          ['1234 1234 1234 123498765||', '1234 1234 1234 123498765||'],

          // Overflow with prohibited characters.
          ['1234 1234 1234 1234||', '1234 1234 1234 1234||'],
          ['1234 1234 1234 1234a||', '1234 1234 1234 1234||'],
          ['1234 1234 1234 12349a||', '1234 1234 1234 12349||'],
          ['1234 1234 1234 12349a||8', '1234 1234 1234 12349||8'],
        ];

        validate(tests, {
          format: '**** **** **** ****',
          permit: /\d/,
          overflow: true,
        });
      });

      it('returns the correct value with trailing format characters', function() {
        // TODO
      });
    });
  });
});

// TODO: Test `last`.
// TODO: Test `input` event.
// TODO: Test focus-tracking with mocking.
