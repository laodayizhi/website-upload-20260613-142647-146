(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var list = document.querySelector('[data-card-list]');
    if (!list) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var input = document.querySelector('[data-filter-input]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = (!keyword || text.indexOf(keyword) !== -1) && (!typeValue || cardType === typeValue) && (!yearValue || cardYear === yearValue);
        card.hidden = !matched;
      });
    }
    [input, type, year].forEach(function (node) {
      if (node) node.addEventListener('input', apply);
      if (node) node.addEventListener('change', apply);
    });
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[char];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_INDEX) return;
    var empty = document.querySelector('[data-search-empty]');
    var input = document.getElementById('searchPageInput');
    var query = new URLSearchParams(window.location.search).get('q') || '';
    if (input) input.value = query;
    function render(term) {
      var value = normalize(term);
      var matches = window.SEARCH_INDEX.filter(function (item) {
        return !value || normalize(item.text).indexOf(value) !== -1;
      }).slice(0, 120);
      results.innerHTML = matches.map(function (item) {
        return '<a class="group block movie-card" href="' + escapeHtml(item.href) + '">' +
          '<div class="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">' +
          '<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>' +
          '<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span class="play-icon">▶</span></div>' +
          '<div class="absolute top-3 right-3"><span class="px-2 py-1 bg-yellow-500/90 text-black text-xs font-semibold rounded-full">' + escapeHtml(item.year) + '</span></div>' +
          '<div class="absolute bottom-0 left-0 right-0 p-4"><h2 class="font-bold text-white mb-1 line-clamp-2 group-hover:text-yellow-300 transition-colors">' + escapeHtml(item.title) + '</h2><div class="flex items-center justify-between text-xs text-gray-300"><span>' + escapeHtml(item.type) + '</span><span>★ ' + escapeHtml(item.score) + '</span></div></div>' +
          '</div><p class="text-gray-300 text-sm line-clamp-2 mt-2">' + escapeHtml(item.brief) + '</p></a>';
      }).join('');
      if (empty) empty.hidden = matches.length > 0;
    }
    render(query);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  function setupBackTop() {
    var button = document.querySelector('[data-backtop]');
    if (!button) return;
    function sync() {
      button.classList.toggle('is-visible', window.scrollY > 420);
    }
    button.addEventListener('click', function () {
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
    window.addEventListener('scroll', sync, {passive: true});
    sync();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupBackTop();
  });
})();
