(function () {
    window.createMoviePlayer = function (source) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var button = document.querySelector('[data-player-button]');
        var playerReady = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function loadSource() {
            if (playerReady) {
                return;
            }
            playerReady = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function showOverlay() {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        }

        function startPlayback() {
            loadSource();
            hideOverlay();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    showOverlay();
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', hideOverlay);
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                showOverlay();
            }
        });
        video.addEventListener('ended', showOverlay);
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
