jQuery(function($) {
	var app = {
		count:		$("#count"),
		every:		$("#every"),
		sound:		$("#sound"),
		calendar:	$("#calendar"),
		video:		$("#background-video"),

		callback: function(){
		},

		turn: function() {
			$.post("/app", {increment: 1});

			var s = app.count.find("strong");
			var i = parseInt(s.data('count')) + 1;

		  	s.text(app.sanitize(i)).data('count', i);;
			localStorage.setItem('count', i);

            return app.count.fadeIn();
		},

		sanitize: function(number) {
			if(number < 2 || number > 4)
				return number + " раз";

			return number + " раза";
		},

		get: function() {
			if(localStorage.getItem('count')) {
				app.count.find("strong").data('count', parseInt(localStorage.getItem('count')) - 1);
				app.turn();
			}

			$.ajax({
				type: 'GET', url: '/app', timeout: 5000,
				success: function(data){
					if(!data.success)
						return;

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
				callback: function() {
					app.callback
				}
			});
		},

		mute: function() {
			var player = app.video.data('ytPlayer').player;

			app.sound.toggleClass("mute");

			if(app.sound.hasClass("mute"))
				return player.mute();

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
