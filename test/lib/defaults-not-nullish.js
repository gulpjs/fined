'use strict';

var defaults = require('../../lib/defaults-not-nullish');
var expect = require('expect');

describe('lib/default-not-nullish', function() {

  it('returns a new object which combined properties of 1st and 2nd objects',
  function(done) {
    var srcObj = { a: 1, b: 2 };
    var defObj = { c: 3, d: 4 };
    var newObj = defaults(srcObj, defObj);
    expect(newObj).toNotBe(srcObj);
    expect(newObj).toNotBe(defObj);
    expect(newObj).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    done();
  });

  it('properties of 1st object take over properties of 2nd object',
  function(done) {
    var srcObj = { a: 'A', b: 'B', c: 'C' };
    var defObj = { b: 2, c: 3, d: 4 };
    var newObj = defaults(srcObj, defObj);
    expect(newObj).toNotBe(srcObj);
    expect(newObj).toNotBe(defObj);
    expect(newObj).toEqual({ a: 'A', b: 'B', c: 'C', d: 4 });
    done();
  });

  it('ignore nullish properties', function(done) {
    var srcObj = { a: 'A', b: null, c: 'C', d: undefined, e: 0, f: '' };
    var newObj = defaults(srcObj, null);
    expect(newObj).toEqual({ a: 'A', c: 'C', e: 0, f: '' });

    newObj = defaults(srcObj, {});
    expect(newObj).toEqual({ a: 'A', c: 'C', e: 0, f: '' });

    newObj = defaults(srcObj, { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
    expect(newObj).toEqual({ a: 'A', b: 2, c: 'C', d: 4, e: 0, f: '' });


    newObj = defaults(null, srcObj);
    expect(newObj).toEqual({ a: 'A', c: 'C', e: 0, f: '' });

    newObj = defaults({}, srcObj);
    expect(newObj).toEqual({ a: 'A', c: 'C', e: 0, f: '' });

    newObj = defaults({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }, srcObj);
    expect(newObj).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
    done();
  });
});
