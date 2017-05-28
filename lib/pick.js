'use strict';

function pick(srcObj, keys) {
  var newObj = {};

  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  if (!srcObj) {
    return newObj;
  }

  Object.keys(srcObj).forEach(function(key) {
    if (keys.indexOf(key) >= 0) {
      newObj[key] = srcObj[key];
    }
  });

  return newObj;
}

module.exports = pick;
