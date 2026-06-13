(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-player-video]');
    var layer = document.querySelector('[data-player-layer]');
    var button = document.querySelector('[data-player-button]');
    var uri = window.__videoUri || '';
    var attached = false;
    var hls = null;
    if (!video || !uri) return;

    function attach() {
      if (attached) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = uri;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({enableWorker: true, lowLatencyMode: true});
        hls.loadSource(uri);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = uri;
      attached = true;
    }

    function start() {
      attach();
      if (layer) layer.classList.add('is-hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (button) button.addEventListener('click', start);
    if (layer) layer.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) start();
    });
    video.addEventListener('play', function () {
      if (layer) layer.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  });
})();
