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
   * Audio element
   */
  var audio = document.getElementById('audio');


  /**
   * Store user sound choice
   */
  var muted = false;

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
    client = new WebSocket('wss://remailer.ru:8000');

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
   * Handle sound button
   */
  sound.addEventListener('click', function (e) {
    e.preventDefault();

    muted = true;

    if (document.getElementById('audio').paused) {
      muted = false;
      return audio.play();
    }

    return audio.pause();
  });

  /**
   * Handle audio pause event
   */
  audio.addEventListener('pause', function() {
    sound.classList.add('sound--stop');
  });

  /**
   * Handle audio play event
   */
  audio.addEventListener('playing', function() {
    sound.classList.remove('sound--stop');
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
      if (!muted && document.getElementById('audio').paused) {
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


  return connect();
})();
