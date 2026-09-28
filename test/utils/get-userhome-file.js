"use strict";

var os = require("os");
var fs = require("fs");
var path = require("path");

var userHomeDir = os.homedir();
var userHomeFiles = fs.readdirSync(userHomeDir);

var userHomeFilePath, userHomeFileExt, userHomeFileName, userHomeFileDir;

if (userHomeFiles.length > 0) {
  var filePath = path.resolve(userHomeDir, userHomeFiles[0]);
  userHomeFilePath = filePath;
  userHomeFileDir = path.dirname(userHomeFilePath);
  userHomeFileExt = path.extname(userHomeFilePath);
  userHomeFileName = path.basename(userHomeFilePath, userHomeFileExt);
}

module.exports = {
  path: userHomeFilePath,
  name: userHomeFileName,
  ext: userHomeFileExt,
  dir: userHomeFileDir,
};
