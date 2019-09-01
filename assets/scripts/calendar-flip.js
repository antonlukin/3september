(function () {
  var client = null;

  /**
   * Store last clicked timestamp
   */
  var clicked = 0;

  /**
   * Calendar element
   */
  var calendar = document.getElementById('calendar');


  /**
   * Connect the socket
   */
  function connect() {
    client = new WebSocket('wss://3september.ru:8000');

    client.onmessage = function (e) {
      console.log(e.data);
    };

    client.onclose = function () {
      reconnect();
    };
  }


  /**
   * Reconnecting socket
   */
  function reconnect() {
    if (!client || client.readyState == WebSocket.CLOSED) {
      connect();
    }
  }


  /**
   * Flip calendar event
   */
  calendar.addEventListener('click', function (e) {
    e.preventDefault();

    // Flip calendar only once per 1.5s
    if (Date.now() - clicked > 1500) {
      clicked = Date.now();

      var page = calendar.querySelector('.calendar__page:last-child');
      page.classList.add('calendar__page--animate');

      function stopFlip() {
        page.classList.remove('calendar__page--animate');
        page.removeEventListener('animationend', stopFlip);
      }

      page.addEventListener('animationend', stopFlip);

      return client.send('update');
    }
  });

return;
  /**
   * Update common counter once per 5s
   */
  setInterval(function () {
    return client.send('receive');
  }, 5000);


  return connect();
})();