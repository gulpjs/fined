'use strict';

function isString(value) {
  if (typeof value === 'string') {
    return true;
  }

  if (Object.prototype.toString.call(value) === '[object String]') {
    return true;
  }

  return false;
}

module.exports = isString;
