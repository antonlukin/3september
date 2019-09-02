(function () {
  /**
   * Open share popup window
   */
  function openPopup(url, params) {
      var left = Math.round(screen.width / 2 - params.width / 2);
      var top = 0;
      if (screen.height > params.height) {
      top = Math.round(screen.height / 3 - params.height / 2);
      }
      return window.open(url, params.id, 'left=' + left + ',top=' + top + ',' +
      'width=' + params.width + ',height=' + params.height + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
  }
  /**
   * Get all share buttons to add event and counter
   */
  var links = document.querySelectorAll('.share');
  if (links === null) {
      return false;
  }
  for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
      e.preventDefault();
      return openPopup(this.href, {
          width: 600,
          height: 400,
          id: this.dataset.label
      })
      });
  }
})();