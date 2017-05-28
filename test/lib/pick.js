'use strict';

var expect = require('expect');
var pick = require('../../lib/pick');

describe('lib/pick', function() {

  it('returns a new object with picked properties when 2nd param. is an array',
  function(done) {
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, ['a', 'b', 'd']))
      .toEqual({ a: 1, b: { c: 3 }, d: 4 });
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, ['a', 'b']))
      .toEqual({ a: 1, b: { c: 3 } });
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, ['a', 'c']))
      .toEqual({ a: 1 });
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, ['a']))
      .toEqual({ a: 1 });
    done();
  });

  it('returns a new object with a pick properties when 2nd param. is a string',
  function(done) {
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, 'a')).toEqual({ a: 1 });
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, 'b')).toEqual({ b: { c: 3 } });
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, 'd')).toEqual({ d: 4 });
    done();
  });

  it('returns an empty object when no matching property', function(done) {
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, ['x', 'y'])).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, [])).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, 'b.c')).toEqual({});
    done();
  });

  it('returns an empty object when a parameter `srcObj` is nullish',
  function(done) {
    expect(pick(undefined, ['a', 'b'])).toEqual({});
    expect(pick(null, ['a', 'b'])).toEqual({});
    done();
  });

  it('returns an empty object when a parameter `keys` is not an array or ' +
  'a string', function(done) {
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, undefined)).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, null)).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, true)).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, false)).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, 0)).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, 123)).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, {})).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, { a: 1 })).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, { b: { c: 3 } })).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, { c: 3 })).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, function a() {})).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, function b() {})).toEqual({});
    expect(pick({ a: 1, b: { c: 3 }, d: 4 }, function d() {})).toEqual({});
    done();
  });

});

