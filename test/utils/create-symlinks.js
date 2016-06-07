'use strict';

var fs = require('fs');
var path = require('path');

var dir = path.resolve(__dirname, '../fixtures/fined');
var basedir = path.resolve(__dirname, '../../');

var symlinkedFiles = [0,1,2,3,4,5].map(function(v, j) {
  return path.resolve(dir, 'symlink' + j + '.json');
});

if (fs.existsSync(symlinkedFiles[0])) {
  for (var i0 = symlinkedFiles.length - 1; i0 >= 0; i0--) {
    fs.unlinkSync(symlinkedFiles[i0]);
  }
}

var linkedFiles = ['package.json', 'xxxx', 'test/'];
for (var i = 0, n = linkedFiles.length; i < n; i++) {
  fs.symlinkSync(path.resolve(basedir, linkedFiles[i]), symlinkedFiles[i * 2]);
  fs.symlinkSync(symlinkedFiles[i * 2], symlinkedFiles[i * 2 + 1]);
}

module.exports = symlinkedFiles.map(function(pth) {
  var ext = path.extname(pth);
  return {
    path: pth,
    dir: path.dirname(pth),
    ext: ext,
    name: path.basename(pth, ext),
  };
});
