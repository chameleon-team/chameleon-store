var path = require('path');

exports.resolveRoot = function(dir) {
  return path.resolve(__dirname, '../..', dir)
}

exports.resolveTestOutput = function(dir, type) {
  return path.resolve(__dirname, `../.chameleon-store/${type}`, dir)
}

exports.resolveTestSrc = function(dir, type) {
  return path.resolve(__dirname, `../.chameleon-store/${type}/src`, dir)
}