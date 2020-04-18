module.exports = function() {
  var Module = Module || require('./crypto');

  Module.isReady = new Promise(resolve => {
    Module.onRuntimeInitialized = resolve;
  });

  return Module;
}();
