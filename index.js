'use strict';

var fs = require('fs');
var path = require('path');

var isString = require('lodash.isstring');
var isArray = require('lodash.isarray');
var isPlainObject = require('lodash.isplainobject');
var isEmpty = require('lodash.isempty');
var pick = require('lodash.pick');
var assignWith = require('lodash.assignwith');

var expandTilde = require('expand-tilde');
var parsePath = require('parse-filepath');

function assignNullish(objValue, srcValue) {
  return (srcValue == null ? objValue : srcValue);
}

function defaults(mainObj, defaultObj) {
  return assignWith({}, defaultObj, mainObj, assignNullish);
}

function fined(pathObj, defaultObj) {
  var expandedArr = expandPaths(pathObj, defaultObj);
  for (var i = 0, n = expandedArr.length; i < n; i++) {
    var found = findWithExpandedPath(expandedArr[i]);
    if (found) {
      return found;
    }
  }
  return null;
}

function expandPaths(pathObj, defaultObj) {
  if (!isPlainObject(defaultObj)) {
    defaultObj = {};
  }

  if (isString(pathObj)) {
    pathObj = { path: pathObj };
  }

  if (!isPlainObject(pathObj)) {
    pathObj = {};
  }

  pathObj = defaults(pathObj, defaultObj);

  var filePath;
  if (!isString(pathObj.path)) {
    return [];
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

  var basedir = isString(pathObj.cwd) ? pathObj.cwd.toString() : '.';
  basedir = path.resolve(expandTilde(basedir));

  var findUp = !!pathObj.findUp;

  var parsed = parsePath(filePath);
  if (parsed.isAbsolute) {
    filePath = filePath.slice(parsed.root.length);
    findUp = false;
    basedir = parsed.root;
  } else if (parsed.root) { // Expanded path has a drive letter on Windows.
    filePath = filePath.slice(parsed.root.length);
    basedir = path.resolve(parsed.root);
  }

  return extArr.map(function(ext) {
    ext = ext.toString(); // Execution of toString is for a String object.
    return {
      path: filePath + ext,
      basedir: basedir,
      findUp: findUp,
      extension: (extMap ? pick(extMap, ext) : ext),
    };
  });
}

function findWithExpandedPath(expanded) {
  var found = expanded.findUp ?
    findUpFile(expanded.path, expanded.basedir) :
    findFile(path.resolve(expanded.basedir, expanded.path));

  return !found ? null : { path: found, extension: expanded.extension };
}

function findFile(filepath) {
  try {
    fs.statSync(filepath);
    return filepath;
  } catch (e) {}

  return null;
}

function findUpFile(filepath, basedir) {
  var lastdir;
  do {
    var found = findFile(path.resolve(basedir, filepath));
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

  if (isArray(exts)) {
    exts = exts.filter(isString);
    return (exts.length > 0) ? exts : [''];
  }

  if (isPlainObject(exts)) {
    exts = Object.keys(exts);
    return (exts.length > 0) ? exts : [''];
  }

  return [''];
}

function createExtensionMap(exts) {
  if (!isPlainObject(exts)) {
    return null;
  }

  if (isEmpty(exts)) {
    return { '': null };
  }

  return exts;
}

module.exports = fined;
