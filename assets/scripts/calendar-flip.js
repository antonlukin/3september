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
   * Video element
   */
  var micro = document.getElementById('micro');

  /**
   * Karaoke text element
   */
  var karaoke = document.getElementById('karaoke');

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
    var cases = [2, 0, 1, 1, 1, 2];
    var forms = [' раз', ' раза', ' раз'];

    // https://gist.github.com/realmyst/1262561
    var title = forms[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];

    return spaces(number) + title;
  }


  /**
   * Connect the socket
   */
  function connect() {
    client = new WebSocket('wss://3september.ru/receive/');

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

    var left = Math.round(screen.width / 2 - params.width / 2);
    var top = 0;

    if (screen.height > params.height) {
      top = Math.round(screen.height / 3 - params.height / 2);
    }

    return window.open(url, params.id, 'left=' + left + ',top=' + top + ',' +
      'width=' + params.width + ',height=' + params.height + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
  }


  /**
   * Handle micro button
   */
  micro.addEventListener('click', function (e) {
    micro.classList.toggle('micro--active');

    var active = micro.classList.contains('micro--active');
    karaoke.classList.toggle('karaoke--active', active);

    sound.classList.remove('sound--stop');
    video.muted = false;
  });

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
   * Update karaoke lines
   */
  video.addEventListener('timeupdate', function() {
    var lines = karaoke.querySelectorAll('p');

    for(var i = 0; i < lines.length; i++) {
      var start = parseFloat(lines[i].getAttribute('data-start'));
      var end = i < lines.length - 1 ? parseFloat(lines[i + 1].getAttribute('data-start')) : video.duration;

      if (video.currentTime >= start && video.currentTime <= end) {
        lines[i].classList.add('karaoke__line--active');
      } else {
        lines[i].classList.remove('karaoke__line--active')
      }
    }
  });


  /**
   * Flip calendar event
   */
  calendar.addEventListener('click', function (e) {
    e.preventDefault();

    var formdata = JSON.stringify({data: 'counter'});

    // Flip calendar only once per 1.5s
    if (Date.now() - clicked > 1500) {
      clicked = Date.now();

      var request = new XMLHttpRequest();

      request.open('POST', 'https://3september.ru/update/');
      request.setRequestHeader('Content-type', 'application/json');

      request.send(formdata);

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
      client.send('counter');
    }
  }, 5000);


  /**
   * Update counter with local storage value
   */
  if (localStorage.getItem('count')) {
    counter = parseInt(localStorage.getItem('count'));
  }


  /**
   * Load calendar image and flip it than
   */
  var image = new Image();
  image.src = '/images/calendar.jpg';

  image.onload = function() {
    var items = calendar.querySelectorAll('.calendar__page-front');

    for (var i = 0; i < items.length; i++) {
      items[i].style.backgroundImage = 'url(' + image.src + ')';
    }

    setTimeout(function() {
      return turnover();
    }, 500)
  }


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
