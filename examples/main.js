(function() {
  document.addEventListener('click', router);

  function router(e) {
    var target = e.target;

    var behavior = target.getAttribute('data-behavior');

    switch (behavior) {
      case 'import-key': return importFile(target);
      case 'export-key': return exportFile(target);
      case 'generate-key': return generateKey(target);
      default: return;
    }
  }

  function generateKey(target) {
    var data = 'test';
    var input = target.nextElementSibling;

    // TODO: Generate and pack file
    var file = new window.Blob([data], { type: 'text/plain' });

    // Download link
    var downloadLink = window.document.createElement('a');

    // File name
    downloadLink.download = input.value + '.txt';

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(file);

    // Hide download link
    downloadLink.style.display = 'none';

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
  }

  function importFile(e) {
    console.log('Import');
  }

  function exportFile() {
    console.log('Export');
  }
})();


