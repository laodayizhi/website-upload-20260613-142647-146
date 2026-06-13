(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function createResultItem(movie) {
    var link = document.createElement('a');
    link.className = 'search-result-item';
    link.href = movie.url;

    var img = document.createElement('img');
    img.src = movie.cover;
    img.alt = movie.title + ' 海报';
    img.loading = 'lazy';

    var text = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = movie.title;
    var meta = document.createElement('span');
    meta.textContent = movie.region + ' · ' + movie.type + ' · ' + movie.year;

    text.appendChild(title);
    text.appendChild(meta);
    link.appendChild(img);
    link.appendChild(text);
    return link;
  }

  function attachGlobalSearch() {
    var panels = document.querySelectorAll('[data-search-panel]');
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-global-search]');
      var results = panel.querySelector('[data-search-results]');
      if (!input || !results || typeof MOVIE_INDEX === 'undefined') {
        return;
      }
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        results.innerHTML = '';
        if (value.length < 1) {
          results.classList.remove('is-open');
          return;
        }
        var matches = MOVIE_INDEX.filter(function (movie) {
          var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.line, (movie.tags || []).join(' ')].join(' ').toLowerCase();
          return haystack.indexOf(value) !== -1;
        }).slice(0, 12);
        matches.forEach(function (movie) {
          results.appendChild(createResultItem(movie));
        });
        if (!matches.length) {
          var empty = document.createElement('div');
          empty.className = 'search-result-item';
          empty.textContent = '没有找到匹配影片';
          results.appendChild(empty);
        }
        results.classList.add('is-open');
      });
      document.addEventListener('click', function (event) {
        if (!panel.contains(event.target)) {
          results.classList.remove('is-open');
        }
      });
    });
  }

  function attachMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function attachHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) {
        dots[index].classList.remove('is-active');
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      if (dots[index]) {
        dots[index].classList.add('is-active');
      }
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });
    start();
  }

  function attachCategoryFilter() {
    var filterInput = document.querySelector('[data-category-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');
    if (!cards.length || (!filterInput && !typeSelect && !regionSelect)) {
      return;
    }
    function applyFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !type || card.dataset.type === type;
        var matchedRegion = !region || card.dataset.region === region;
        var matched = matchedKeyword && matchedType && matchedRegion;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-open', shown === 0);
      }
    }
    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }
  }

  function attachPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var url = player.getAttribute('data-video');
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (loaded || !video || !url) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }
      loaded = true;
    }

    function startPlayback() {
      loadVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  ready(function () {
    attachMenu();
    attachGlobalSearch();
    attachHero();
    attachCategoryFilter();
    attachPlayer();
  });
}());
