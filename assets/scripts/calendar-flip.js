(function () {
  var client = null;

  /**
   * Store last clicked timestamp
   */
  var clicked = Date.now();;

  /**
   * Calendar element
   */
  var calendar = document.getElementById('calendar');

  /**
   * Sound element
   */
  var sound = document.getElementById('sound');

  /**
   * Video element
   */
  var video = document.getElementById('video');

  /**
   * Current user turn counter
   */
  var counter = 0;


  /**
   * Add spaces to number
   */
  function spaces(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }


  /**
   * Sanitize number
   */
  function sanitize(number) {
    if (number > 9 && number < 20) {
      return spaces(number) + " раз";
    }

    if (number % 10 < 2 || number % 10 > 4) {
      return spaces(number) + " раз";
    }

    return spaces(number) + " раза";
  }


  /**
   * Connect the socket
   */
  function connect() {
    client = new WebSocket('wss://3september.ru:8000');

    client.onmessage = function (e) {
      var more = document.querySelector('.counter--more');
      more.querySelector('strong').innerHTML = sanitize(e.data);
      more.classList.remove('counter--hidden');
    };

    client.onclose = function () {
      reconnect();
    };

    client.onerror = function (e) {
      console.error("WebSocket error observed: ", e);
    };
  }


  /**
   * Reconnecting socket
   */
  function reconnect() {
    if (!client || client.readyState == WebSocket.CLOSED) {
      return connect();
    }
  }


  /**
   * Turnover calendar
   */
  function turnover() {
    // Update localStorage counter
    localStorage.setItem('count', ++counter);

    var title = document.querySelector('.counter--title');
    title.querySelector('strong').innerHTML = sanitize(counter);
    title.classList.remove('counter--hidden');

    var page = calendar.querySelector('.calendar__page:last-child');
    page.classList.add('calendar__page--animate');

    function stopFlip() {
      page.classList.remove('calendar__page--animate');
      page.removeEventListener('animationend', stopFlip);
    }

    page.addEventListener('animationend', stopFlip);
  }


  /**
   * Get random number
   */
  function randomize(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  /**
   * Encrypt counter hash
   */
  function encrypt(counter, hash) {
    counter = counter.split('');

    for (var i = 0, j = 0; i < counter.length * 3 || i < 10; i++) {
      var item = randomize(10, 15).toString(16);

      if (i % 3 === 1 && j < counter.length) {
        item = (9 - counter[j++]).toString();
      }

      hash = hash + item;
    }

    return hash;
  }


  /**
   * Open share popup window
   */
  function sharing(url, network, params) {
    url = url + '/social/' + encrypt(counter.toString(), '');

    var title = document.querySelector('.counter--title').textContent;
    title = title.trim() + ' и снова третье сентября';

    if (['vkontakte', 'odnoklassniki'].indexOf(network) >= 0) {
      url = url + '&title=' + encodeURIComponent(title);
    }

    if (['twitter', 'telegram'].indexOf(network) >= 0) {
      url = url + '&text=' + encodeURIComponent(title);
    }

    var left = Math.round(screen.width / 2 - params.width / 2);
    var top = 0;

    if (screen.height > params.height) {
      top = Math.round(screen.height / 3 - params.height / 2);
    }

    return window.open(url, params.id, 'left=' + left + ',top=' + top + ',' +
      'width=' + params.width + ',height=' + params.height + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
  }


  /**
   * Handle sound button
   */
  sound.addEventListener('click', function (e) {
    e.preventDefault();

    // Update sound classes
    sound.classList.add('sound--stop', 'sound--clicked');

    if (!video.muted) {
      return video.muted = true;
    }

    // Remove stop class
    sound.classList.remove('sound--stop');

    return video.muted = false;
  });


  /**
   * Flip calendar event
   */
  calendar.addEventListener('click', function (e) {
    e.preventDefault();

    // Flip calendar only once per 1.5s
    if (Date.now() - clicked > 1500) {
      clicked = Date.now();

      // Send update message to server
      if (client && client.readyState == WebSocket.OPEN) {
        client.send('update');
      }

      // Start sound if paused
      if (!sound.classList.contains('sound--clicked') && video.muted) {
        sound.click();
      }

      return turnover();
    }
  });


  /**
   * Update common counter once per 5s
   */
  setInterval(function () {
    if (client && client.readyState == WebSocket.OPEN) {
      client.send('receive');
    }
  }, 5000);


  /**
   * Update counter with local storage value
   */
  if (localStorage.getItem('count')) {
    counter = parseInt(localStorage.getItem('count'));
  }


  /**
   * Flip calendar on window load
   */
  window.addEventListener('load', function () {
    return turnover();
  });


  /**
   * Get all share buttons to add event and counter
   */
  var links = document.querySelectorAll('.share');

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      e.preventDefault();

      return sharing(this.href, this.dataset.label, {
        width: 600,
        height: 400,
        id: this.dataset.label
      })
    });
  }

  return connect();
})();
