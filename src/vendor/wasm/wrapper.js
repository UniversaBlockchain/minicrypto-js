module.exports = function() {
  console.log("run module importer");
  var Module = Module || require('./main');

  return Module;
}();
