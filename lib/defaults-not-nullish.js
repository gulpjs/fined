'use strict';

function defaultsNotNullish(mainObj, defaultObj) {
  mainObj = mainObj || {};
  defaultObj = defaultObj || {};

  var keys = Object.keys(mainObj).concat(Object.keys(defaultObj));
  var newObj = {};

  keys.forEach(function(key) {
    if (mainObj[key] != null) {
      newObj[key] = mainObj[key];
      return;
    }

    if (defaultObj[key] != null) {
      newObj[key] = defaultObj[key];
      return;
    }
  });

  return newObj;
}

module.exports = defaultsNotNullish;
