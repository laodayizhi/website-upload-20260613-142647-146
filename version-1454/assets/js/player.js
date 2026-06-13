(function () {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-player-button]');
    var source = window.currentVideoUrl;
    var hls = null;
    var ready = false;

    if (!video || !source) {
        return;
    }

    function showMessage(text) {
        if (overlay) {
            overlay.innerHTML = '<span class="play-circle">▶</span><strong>' + text + '</strong>';
        }
    }

    function setupSource() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage('播放暂时不可用');
                }
            });
            return;
        }

        video.src = source;
    }

    function start() {
        setupSource();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.controls = true;
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
                showMessage('点击继续播放');
            });
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
