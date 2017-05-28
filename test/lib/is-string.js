'use strict';

var expect = require('expect');
var isString = require('../../lib/is-string');

describe('lib/is-string', function() {

  it('returns true when value is a string or a String object', function(done) {
    expect(isString('')).toEqual(true);
    expect(isString('abc')).toEqual(true);
    expect(isString(Object(''))).toEqual(true);
    expect(isString(Object('abc'))).toEqual(true);
    done();
  });

  it('returns false when value is the other type', function(done) {
    expect(isString(undefined)).toEqual(false);
    expect(isString(null)).toEqual(false);
    expect(isString(true)).toEqual(false);
    expect(isString(false)).toEqual(false);
    expect(isString(0)).toEqual(false);
    expect(isString(123)).toEqual(false);
    expect(isString({})).toEqual(false);
    expect(isString({ a: 1 })).toEqual(false);
    expect(isString([])).toEqual(false);
    expect(isString([1, 2, 3])).toEqual(false);
    expect(isString(function() {})).toEqual(false);
    expect(isString(new Date())).toEqual(false);

    expect(isString(Object(undefined))).toEqual(false);
    expect(isString(Object(null))).toEqual(false);
    expect(isString(Object(true))).toEqual(false);
    expect(isString(Object(false))).toEqual(false);
    expect(isString(Object(0))).toEqual(false);
    expect(isString(Object(123))).toEqual(false);
    done();
  });
});
