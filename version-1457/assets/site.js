(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function rootPrefix() {
    return document.body.dataset.root || ".";
  }

  function pathFromRoot(path) {
    var root = rootPrefix();
    return root === "." ? "./" + path : root + "/" + path;
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initSiteSearchForms() {
    var forms = document.querySelectorAll("[data-site-search-form]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = pathFromRoot("search.html");

        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }

        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var input = document.querySelector("[data-local-filter]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    if (!input && !select) {
      return;
    }

    function applyFilter() {
      var query = input ? normalize(input.value) : "";
      var type = select ? normalize(select.value) : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.dataset.search);
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !type || text.indexOf(type) !== -1;
        var visible = matchesQuery && matchesType;

        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.style.display = visibleCount ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (select) {
      select.addEventListener("change", applyFilter);
    }

    applyFilter();
  }

  function initPlayer() {
    var stage = document.querySelector("[data-player-stage]");

    if (!stage) {
      return;
    }

    var video = stage.querySelector("video");
    var overlay = stage.querySelector("[data-player-overlay]");
    var button = stage.querySelector("[data-play-button]");
    var source = video ? video.dataset.videoUrl : "";
    var hasLoaded = false;

    function loadAndPlay() {
      if (!video || !source) {
        return;
      }

      if (!hasLoaded) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }

        hasLoaded = true;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", loadAndPlay);
    }

    stage.addEventListener("click", function (event) {
      if (event.target === video) {
        return;
      }
      loadAndPlay();
    });
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function cardForResult(item) {
    var root = rootPrefix();
    var imagePath = root === "." ? "./" + item.cover : root + "/" + item.cover;
    var moviePath = root === "." ? "./" + item.url : root + "/" + item.url;
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\" data-movie-card data-search=\"" + escapeHtml(item.searchText) + "\">",
      "  <a class=\"movie-poster\" href=\"" + moviePath + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">",
      "    <img src=\"" + imagePath + "\" alt=\"" + escapeHtml(item.title) + "封面\" loading=\"lazy\" />",
      "    <span class=\"poster-shade\"></span>",
      "    <span class=\"play-chip\">播放</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <a class=\"movie-title\" href=\"" + moviePath + "\">" + escapeHtml(item.title) + "</a>",
      "    <div class=\"movie-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
      "    <p class=\"movie-line\">" + escapeHtml(item.oneLine) + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var resultBox = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!form || !input || !resultBox || !summary || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function render(query) {
      var normalizedQuery = normalize(query);
      var results = window.MOVIE_SEARCH_DATA;

      if (normalizedQuery) {
        results = results.filter(function (item) {
          return normalize(item.searchText).indexOf(normalizedQuery) !== -1;
        });
      }

      results = results.slice(0, 240);
      resultBox.innerHTML = results.map(cardForResult).join("");
      summary.textContent = normalizedQuery
        ? "搜索“" + query + "”共展示 " + results.length + " 条匹配结果。"
        : "请输入关键词，或直接浏览下方推荐结果。";
    }

    var initialQuery = getSearchQuery();
    input.value = initialQuery;
    render(initialQuery);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = pathFromRoot("search.html");

      if (query) {
        url += "?q=" + encodeURIComponent(query);
      }

      window.history.replaceState(null, "", url);
      render(query);
    });
  }

  ready(function () {
    initMobileMenu();
    initSiteSearchForms();
    initHero();
    initLocalFilters();
    initPlayer();
    initSearchPage();
  });
})();
