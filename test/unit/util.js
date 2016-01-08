var expect = require('chai').expect;
var util = require('../../src/util');

describe('util', function() {
  describe('assert', function() {
    it('does not throw for truthy values', function() {
      expect(function() {
        util.assert(1);
      }).not.to.throw;
    });

    it('throws for falsey values', function() {
      expect(function() {
        util.assert(0);
      }).to.throw;
    });

    it('includes an optional message when it throws', function() {
      var message = 'Optional message';
      expect(function() {
        util.assert(0, message);
      }).to.throw(message);
    });
  });

  describe('create', function() {
    beforeEach(function() {
      this.prototype = {
        bool: true,
        fn: function() {
          return 42;
        },
      };
      this.obj = util.create(this.prototype);
    });

    it('returns an object with the expected properties', function() {
      expect(this.obj.bool).to.be.true;
      expect(this.obj.fn()).to.equal(42);
    });

    it('returns an object that supports property shadowing', function() {
      this.obj.bool = false;
      expect(this.obj.bool).to.be.false;
      expect(this.prototype.bool).to.be.true;
    });
  });

  describe('wrap', function() {
    describe('fn', function() {
      it('wraps a non-function value', function() {
        var fn = util.wrap.fn(42);
        expect(fn).to.be.a.function;
        expect(fn()).to.equal(42);
      });

      it('does not double-wrap a function', function() {
        var fn = util.wrap.fn(function() {
          return 42;
        });
        expect(fn).to.be.a.function;
        expect(fn()).to.equal(42);
      });
    });

    describe('arr', function() {
      it('wraps a non-array value', function() {
        var arr = util.wrap.arr(42);
        expect(arr).to.be.an.array;
        expect(arr.length).to.equal(1);
        expect(arr[0]).to.equal(42);
      });

      it('does not double-wrap an array', function() {
        var arr = util.wrap.arr([42]);
        expect(arr).to.be.an.array;
        expect(arr.length).to.equal(1);
        expect(arr[0]).to.equal(42);
      });
    });
  });

  describe('type', function() {
    var types = {
      fn: function() { },
      obj: {},
      str: 'shibari',
      regex: /^$/,
      input: document.createElement('input'),
      undefined: undefined,
      null: null,
    };

    Object.keys(util.type).forEach(function(key) {
      var fn = util.type[key];

      describe(key, function() {
        it('identifies values of the type', function() {
          expect(fn(types[key])).to.be.true;
        });

        it('identifies values not of the type', function() {
          Object.keys(types).forEach(function(type) {
            if (type === key) {
              return;
            }
            expect(fn(types[type])).to.be.false;
          });
        });
      });
    });
  });

  // TODO: Use mocking to complete.
  describe('log', function() {
  });
});
