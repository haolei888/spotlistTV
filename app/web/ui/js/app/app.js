;(function($) {

	// Plugin constructor with options and methods
	var MainPlugin = function(options) {

		var _self = this;

		var _defaults = {
			animConfig: {
				duration: 800,
				easing: 'easeInOutQuint',
				queue: false
			},
			player: {
				quality: 'hd720',
				autohide: 1
			},

            getPlaylistsApi: '/api/playlists',
            playlistTemplate: '/js/tmpl/playlists.html'
		};

		var _options 	= $.extend(true, {}, _defaults, options);

		var _player = null;
        var _playlists = null;


		this.methods = {

			init: function () {
				// Find page name
				var page = $('#content').data('page');

				// Active navlink indicator
				$('#nav li.nav-' + page).find('a').addClass('secondary');

				switch (page) {

					case "index":
						_self.methods.initIndex();
						break;
				}
			},

			initIndex: function() {
                _self.methods.getPlaylists();
                _self.methods.youTubeLoadPlayer();

			},

			buildVideosArray: function(tracksArr) {
				var videos = [];

				for (var i = 0; i < tracksArr.length; i++) {

					// Extract video ID from Youtube URL.
					var v = tracksArr[i].id.videoId;
					videos.push(v);
				}

				return videos;
			},

            getPlaylists: function() {
				$.ajax({
					url: _options.getPlaylistsApi,
					dataType: 'json'
				})
                .done(function(data) {
                    _playlists = data;
                    _self.methods.renderPlaylists(data);
                });

            },

            clickPlaylist: function(e, el) {
                var playlist = $(this).data('playlist');
                _self.methods.loadPlaylist(playlist);
				$('#player').slideDown();
            },

            loadPlaylist: function(playlistName) {
                var playlist = _.find(_playlists.data, function(playlist) {
                    return playlist.playlist == playlistName
                });

				// Sort by video order from Spotify.
				playlist = _.sortBy(playlist.tracks, function(o){ return o.order });

				var videos = _self.methods.buildVideosArray(playlist);

				_player.loadPlaylist(videos, 0, 5, _options.player.quality);
            },

            renderPlaylists: function(data) {
                var playlistData = data.data;

                $.ajax({
                    url: _options.playlistTemplate,
                    dataType: 'html'
                })
                .done(function(tmpl) {

    				var playlistTmpl = _.template(tmpl);

    				$('#playlists').html(playlistTmpl({data: playlistData}));
                    $('.js-playlist').on('click', _self.methods.clickPlaylist);
                });
            },

			player_Ready: function(e) {
				// e.target.playVideo();
			},

			youTubeLoadPlayer: function() {

				// Setup ready event callback for YouTube iframe API.
				window.onYouTubeIframeAPIReady 	= _self.methods.youTube_IframeAPIReady;

				// Load the YouTube Iframe API.
				var $script = $('<script />', {
					src: 'https://www.youtube.com/iframe_api'
				});

				$('script')
					.first()
					.before($script)
				;
			},

			youTube_IframeAPIReady: function() {

				_player = new YT.Player('player', {

					playerVars: {
						autohide: 		_options.player.autohide,
						autoplay: 		0,
						iv_load_policy: 3,
						modestbranding: 0,
						showinfo: 	1
					},

					events: {
						'onReady': 			_self.methods.player_Ready,
						'onStateChange': 	_self.methods.player_StateChange
					}
				});
			}


		}

		// Initialize
		_self.methods.init();
	};

    // Underscore JS
	// @see http://underscorejs.org
	_.templateSettings = {
		evaluate: 		/\{\{#([\s\S]+?)\}\}/g, 			// {{# console.log("blah") }}
		interpolate: 	/\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g, 	// {{ title }}
		escape: 		/\{\{\{([\s\S]+?)\}\}\}/g, 			// {{{ title }}}
	}

	// Load plugin on document ready
	$(document).ready(new MainPlugin());

})($);
