var expect = require('chai').expect;
var dom = require('../../src/dom');

describe('dom', function() {
  describe('event handling', function() {
    beforeEach(function() {
      this.el = document.createElement('a');
      this.count = 0;
      this.fn = function() {
        this.count++;
      }.bind(this);
    });

    describe('on', function() {
      it('binds an event handler', function() {
        dom.on(this.el, 'click', this.fn);
        this.el.click();
        expect(this.count).to.equal(1);
        this.el.click();
        expect(this.count).to.equal(2);
      });
    });

    describe('off', function() {
      it('unbinds an event handler', function() {
        dom.on(this.el, 'click', this.fn);
        dom.off(this.el, 'click', this.fn);
        this.el.click();
        expect(this.count).to.equal(0);
      });
    });

    describe('target', function() {
      it('returns the target of an event', function() {
        var target;
        dom.on(this.el, 'click', function(e) {
          target = dom.target(e);
        });
        this.el.click();
        expect(target).to.equal(this.el);
      });
    });
  });

  describe('data', function() {
    beforeEach(function() {
      this.el = document.createElement('a');
    });

    it('sets the data attribute', function() {
      var set = dom.data(this.el, 'str', 'abc');
      expect(set).to.equal('abc');
    });

    it('gets the data attribute', function() {
      dom.data(this.el, 'str', 'abc');
      var get = dom.data(this.el, 'str');
      expect(get).to.equal('abc');
    });

    it('deletes the data attribute', function() {
      dom.data(this.el, 'str', 'abc');
      dom.data(this.el, 'str', null);
      var get = dom.data(this.el, 'str');
      expect(get).to.be.undefined;
    });
  });

  // TODO: Write automation tests to verify.
  describe('input', function() {
    beforeEach(function() {
      this.el = document.createElement('input');
      document.body.appendChild(this.el);
    });

    describe('value', function() {
      it('sets the value of an input element', function() {
        var set = dom.input.value(this.el, 'abc');
        expect(set).to.equal('abc');
      });

      it('gets the value of an input element', function() {
        dom.input.value(this.el, 'abc');
        var get = dom.input.value(this.el);
        expect(get).to.equal('abc');
      });
    });

    describe('selection', function() {
      beforeEach(function() {
        this.el.value = 'abc123';
        // Browsers without support for `setSelectionRange` only support a
        // single caret position.
        this.selection = (this.el.setSelectionRange) ?  [2, 4] : [2, 2];
      });

      it('sets the selection range of an input element', function() {
        var set = dom.input.selection(this.el, this.selection);
        expect(set).to.deep.equal(this.selection);
      });

      it('gets the selection range of an input element', function() {
        dom.input.selection(this.el, this.selection);
        var get = dom.input.selection(this.el);
        expect(get).to.deep.equal(this.selection);
      });
    });
  });

  describe('stringify', function() {
    it('returns a simple string respresentation of a plain element', function() {
      var el = document.createElement('input');
      var str = dom.stringify(el);
      expect(str).to.equal('input');
    });

    it('returns a simple string respresentation of an element with an ID', function() {
      var el = document.createElement('input');
      el.id = 'foo';
      var str = dom.stringify(el);
      expect(str).to.equal('input#foo');
    });

    it('returns a simple string respresentation of an element with a class', function() {
      var el = document.createElement('input');
      el.className = 'bar';
      var str = dom.stringify(el);
      expect(str).to.equal('input.bar');
    });

    it('returns a simple string respresentation of an element with multiple classes', function() {
      var el = document.createElement('input');
      el.className = 'bar baz';
      var str = dom.stringify(el);
      expect(str).to.equal('input.bar.baz');
    });

    it('returns a simple string respresentation of an element with an ID and multiple classes', function() {
      var el = document.createElement('input');
      el.id = 'foo';
      el.className = 'bar baz';
      var str = dom.stringify(el);
      expect(str).to.equal('input#foo.bar.baz');
    });
  });
});
