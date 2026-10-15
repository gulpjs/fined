"use strict";

const fs = require("node:fs");
const path = require("node:path");

const dir = path.resolve(__dirname, "../fixtures/fined");
const basedir = path.resolve(__dirname, "../../");

const symlinkedFiles = [0, 1, 2, 3, 4, 5].map(function (v, j) {
  return path.resolve(dir, "symlink" + j + ".json");
});

if (fs.existsSync(symlinkedFiles[0])) {
  for (const symlinkedFile of symlinkedFiles) {
    fs.unlinkSync(symlinkedFile);
  }
}

const linkedFiles = [
  { path: "package.json", type: "file" },
  { path: "xxxx", type: "file" },
  { path: "test/", type: "dir" },
];
for (const [i, file] of linkedFiles.entries()) {
  fs.symlinkSync(
    path.resolve(basedir, file.path),
    symlinkedFiles[i * 2],
    file.type,
  );
  fs.symlinkSync(symlinkedFiles[i * 2], symlinkedFiles[i * 2 + 1], file.type);
}

module.exports = symlinkedFiles.map(function (pth) {
  const ext = path.extname(pth);
  return {
    path: pth,
    dir: path.dirname(pth),
    ext: ext,
    name: path.basename(pth, ext),
  };
});
