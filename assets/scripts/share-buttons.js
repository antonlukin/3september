(function () {
  /**
   * Update url with title
   */
  function appendTitle(url, network) {
    var title = document.querySelector('.counter--title').textContent;
    title = title.trim() + ' и снова третье сентября';

    if (['vkontakte', 'odnoklassniki'].indexOf(network) >= 0) {
      return url + '&title=' + encodeURIComponent(title);
    }

    if (['twitter', 'telegram'].indexOf(network) >= 0) {
      return url + '&text=' + encodeURIComponent(title);
    }

    return url;
  }


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

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      e.preventDefault();

      return openPopup(appendTitle(this.href, this.dataset.label), {
        width: 600,
        height: 400,
        id: this.dataset.label
      })
    });
  }
})();