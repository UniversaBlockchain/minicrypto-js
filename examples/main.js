(function() {
  document.addEventListener('click', router);
  document.addEventListener('DOMContentLoaded', setAvailable);

  var pki = Universa.pki;
  var prefix = 'universa';

  function router(e) {
    var target = e.target;
    var behavior = data(target, 'behavior');

    switch (behavior) {
      case 'import-key': return importFile(target);
      case 'export-key': return exportFile(target);
      case 'generate-key': return generateKey(target);
      default: return;
    }
  }

  function generateKey(target) {
    var related = relatedNodes(target);
    var name = related.name.value;
    var length = related.bits.value;

    var options = {
      bits: length,
      e: 0x10001,
      workerScript: '../vendor/worker.js'
    };

    Universa.pki.rsa.createKeys(options, function(err, pair) {
      // TODO: Add error processing
      if (err) return console.log(err);

      addOption(globalSelector(), name, name);

      var privateKeyBinary = pair.privateKey.pack('BOSS');
      var publicKeyBinary = pair.publicKey.pack('BOSS');

      localStorage.setItem(path(name, 'privateKey'), privateKeyBinary);
      localStorage.setItem(path(name, 'publicKey'), publicKeyBinary);
    });
  }

  function importFile(target) {
    var type = data(target, 'type');
    var related = relatedNodes(target);
    var fileInput = related['file'];
    var name = related['name'].value;
    var file = fileInput.files[0];

    if (!file || !name) return;

    addOption(globalSelector(), name, name);

    var reader = new FileReader();

    reader.onload = function(e) {
      var contents = e.target.result;
      var key = new pki[type]('BOSS', contents);

      localStorage.setItem(path(name, type), contents);
    };

    reader.readAsText(file);
  }

  function exportFile() {
    var selector = globalSelector();
    var keys = ['privateKey', 'publicKey'];
    var name = selector.value;

    for(var i = 0; i < 2; i++) {
      var type = keys[i];
      var binary = localStorage.getItem(path(name, type));

      if (binary) {
        var file = new window.Blob([binary], { type: 'text/plain' });
        sendFile(name + '-' + type, file);
      }
    }
  }

  function relatedNodes(el) {
    var id = el.getAttribute('data-id');
    var children = document.querySelectorAll('[data-for="' + id + '"]');
    var indexed = {};

    for(var i = 0, len = children.length; i < len; i++) {
      var el = children[i];

      indexed[data(el, 'role')] = el;
    }

    return indexed;
  }

  function path(name, type) {
    return [prefix, type, name].join('-');
  }

  function prefixed(name) {
    return [prefix, name].join('-');
  }

  function data(el, name) {
    return el.getAttribute('data-' + name);
  }

  function sendFile(name, file) {
    var downloadLink = window.document.createElement('a');

    // File name
    downloadLink.download = name + '.boss';

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(file);

    // Hide download link
    downloadLink.style.display = 'none';

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
  }

  function addOption(el, name, value) {
    var available = localStorage.getItem(prefixed('keys'));
    available = available && JSON.parse(available) || {};
    available[name] = true;
    localStorage.setItem(prefixed('keys'), JSON.stringify(available));

    var option = document.createElement("option");
    option.text = name;
    option.value = value;
    el.add(option);
    el.options.selectedIndex = el.options.length - 1;
  }

  function setAvailable() {
    var selector = globalSelector();
    var available = localStorage.getItem(prefixed('keys'));
    if (!available) return;

    available = JSON.parse(available);

    for (var key in available) addOption(selector, key, key);
  }

  function globalSelector() {
    return document.querySelector('[data-behavior="global-selector"]');
  }
})();
