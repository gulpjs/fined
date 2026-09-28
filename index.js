"use strict";

var os = require("os");
var fs = require("fs");
var path = require("path");

function fined(pathObj, defaultObj) {
  var expandedPath = expandPath(pathObj, defaultObj);
  return expandedPath ? findWithExpandedPath(expandedPath) : null;
}

function expandPath(pathObj, defaultObj) {
  if (!isObject(defaultObj)) {
    defaultObj = {};
  }

  if (isString(pathObj)) {
    pathObj = { path: pathObj };
  }

  if (!isObject(pathObj)) {
    pathObj = {};
  }

  pathObj = defaults(pathObj, defaultObj);

  var filePath;
  if (!isString(pathObj.path)) {
    return null;
  }
  // Execution of toString is for a String object.
  if (isString(pathObj.name) && pathObj.name) {
    if (pathObj.path) {
      filePath = expandTilde(pathObj.path.toString());
      filePath = path.join(filePath, pathObj.name.toString());
    } else {
      filePath = pathObj.name.toString();
    }
  } else {
    filePath = expandTilde(pathObj.path.toString());
  }

  var extArr = createExtensionArray(pathObj.extensions);
  var extMap = createExtensionMap(pathObj.extensions);

  var basedir = isString(pathObj.cwd) ? pathObj.cwd.toString() : ".";
  basedir = path.resolve(expandTilde(basedir));

  var findUp = !!pathObj.findUp;

  var parsed = path.parse(filePath);
  if (path.isAbsolute(filePath)) {
    filePath = filePath.slice(parsed.root.length);
    findUp = false;
    basedir = parsed.root;
  } /* istanbul ignore next */ else if (parsed.root) {
    // Expanded path has a drive letter on Windows.
    filePath = filePath.slice(parsed.root.length);
    basedir = path.resolve(parsed.root);
  }

  if (parsed.ext) {
    filePath = filePath.slice(0, -parsed.ext.length);
    // This ensures that only the original extension is matched.
    extArr = [parsed.ext];
  }

  return {
    path: filePath,
    basedir: basedir,
    findUp: findUp,
    extArr: extArr,
    extMap: extMap,
  };
}

function findWithExpandedPath(expanded) {
  var found = expanded.findUp
    ? findUpFile(expanded.basedir, expanded.path, expanded.extArr)
    : findFile(expanded.basedir, expanded.path, expanded.extArr);

  if (!found) {
    return null;
  }

  if (expanded.extMap) {
    found.extension = pick(expanded.extMap, found.extension);
  }
  return found;
}

function findFile(basedir, relpath, extArr) {
  var noExtPath = path.resolve(basedir, relpath);
  for (var i = 0, n = extArr.length; i < n; i++) {
    var filepath = noExtPath + extArr[i];
    try {
      fs.statSync(filepath);
      return { path: filepath, extension: extArr[i] };
    } catch {
      // Ignore error
    }
  }

  return null;
}

function findUpFile(basedir, filepath, extArr) {
  var lastdir;
  do {
    var found = findFile(basedir, filepath, extArr);
    if (found) {
      return found;
    }

    lastdir = basedir;
    basedir = path.dirname(basedir);
  } while (lastdir !== basedir);

  return null;
}

function createExtensionArray(exts) {
  if (isString(exts)) {
    return [exts];
  }

  if (Array.isArray(exts)) {
    exts = exts.filter(isString);
    return exts.length > 0 ? exts : [""];
  }

  if (isObject(exts)) {
    exts = Object.keys(exts);
    return exts.length > 0 ? exts : [""];
  }

  return [""];
}

function createExtensionMap(exts) {
  if (!isObject(exts)) {
    return null;
  }

  if (isEmpty(exts)) {
    return { "": null };
  }

  return exts;
}

function defaults(userObj = {}, defaultObj = {}) {
  var filteredObj = Object.entries(userObj).filter(
    ([_, value]) => value != null,
  );
  return Object.assign({}, defaultObj, Object.fromEntries(filteredObj));
}

function pick(map, match) {
  var entries = Object.entries(map).filter(([key]) => key === match);
  return Object.fromEntries(entries);
}

function isObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
}

function isEmpty(object) {
  return !Object.keys(object).length;
}

function isString(value) {
  if (typeof value === "string") {
    return true;
  }

  if (Object.prototype.toString.call(value) === "[object String]") {
    return true;
  }

  return false;
}

/*
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */
function expandTilde(filepath) {
  var home = os.homedir();

  if (filepath.charCodeAt(0) === 126 /* ~ */) {
    if (filepath.charCodeAt(1) === 43 /* + */) {
      return path.join(process.cwd(), filepath.slice(2));
    }
    return home ? path.join(home, filepath.slice(1)) : filepath;
  }

  return filepath;
}

module.exports = fined;
