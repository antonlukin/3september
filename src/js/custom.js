jQuery(function($) {
  var app = {
    count:     $("#count"),
    every:     $("#every"),
    sound:     $("#sound"),
    calendar:  $("#calendar"),
    video:     $("#background-video"),

    callback: function(){
      app.mute();
    },

    turn: function() {
      $.post("/app", {increment: 1});

      var player = app.video.data('ytPlayer').player;

      if(player.isMuted()) {
        app.mute();
      }

      var s = app.count.find("strong");
      var i = parseInt(s.data('count')) + 1;

      s.text(app.sanitize(i)).data('count', i);;
      localStorage.setItem('count', i);

      return app.count.fadeIn();
    },

    spaces: function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    sanitize: function(number) {
      if(number > 9 && number < 20) {
        return app.spaces(number) + " раз";
      }

      if(number % 10 < 2 || number % 10 > 4) {
        return app.spaces(number) + " раз";
      }

      return app.spaces(number) + " раза";
    },

    get: function() {
      if(localStorage.getItem('count')) {
        app.count.find("strong").data('count', parseInt(localStorage.getItem('count')) - 1);

        var s = app.count.find("strong");
        var i = parseInt(s.data('count')) + 1;

        s.text(app.sanitize(i)).data('count', i);;
        localStorage.setItem('count', i);

        return app.count.fadeIn();
      }

      $.ajax({
        type: 'GET', url: '/app', timeout: 5000,
        success: function(data){
          if(!data.success) {
            return;
          }

          app.every.find("strong").text(app.sanitize(data.success));

          return app.every.fadeIn();
        }
      }, 'json');
    },

    run: function(id) {
      app.video.YTPlayer({
        fitToBackground: true,
        mute: false,
        videoId: id,
        modestbranding: 0,
        autoplay: 1,
        controls: 0,
        autohide: 0,
        playerVars: {rel: 0},
        events: {
          'onReady': app.callback
        }
      });
    },

    mute: function() {
      var player = app.video.data('ytPlayer').player;

      app.sound.toggleClass("mute");

      if(app.sound.hasClass("mute")) {
        return player.mute();
      }

      return player.unMute();
    },

    init: function(){
      app.get();
      app.run('0T4fRpS-tbg');

      app.sound.on('click', app.mute);
      app.calendar.on('click', app.turn);
    }
  }

  $(document).ready(app.init);
});
