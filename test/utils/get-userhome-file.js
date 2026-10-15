"use strict";

const os = require("node:os");
const fs = require("node:fs");
const path = require("node:path");

const userHomeDir = os.homedir();
const userHomeFiles = fs.readdirSync(userHomeDir);

let userHomeFilePath, userHomeFileExt, userHomeFileName, userHomeFileDir;

if (userHomeFiles.length > 0) {
  const filePath = path.resolve(userHomeDir, userHomeFiles[0]);
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
