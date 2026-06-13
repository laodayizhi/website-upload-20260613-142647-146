(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initBackToTop() {
    var button = document.querySelector(".back-to-top");

    if (!button) {
      return;
    }

    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) {
        button.classList.add("is-visible");
      } else {
        button.classList.remove("is-visible");
      }
    });

    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initSearch() {
    var input = document.getElementById("movie-search");
    var region = document.getElementById("region-filter");
    var type = document.getElementById("type-filter");
    var year = document.getElementById("year-filter");
    var reset = document.getElementById("reset-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("#search-results .movie-card"));

    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      input.value = query;
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function filter() {
      var keyword = valueOf(input);
      var selectedRegion = valueOf(region);
      var selectedType = valueOf(type);
      var selectedYear = valueOf(year);

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags,
          card.textContent
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !selectedRegion || valueOf({ value: card.dataset.region || "" }) === selectedRegion;
        var matchType = !selectedType || valueOf({ value: card.dataset.type || "" }) === selectedType;
        var matchYear = !selectedYear || valueOf({ value: card.dataset.year || "" }) === selectedYear;
        card.classList.toggle("hidden-card", !(matchKeyword && matchRegion && matchType && matchYear));
      });
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", filter);
        element.addEventListener("change", filter);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        input.value = "";
        if (region) {
          region.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        filter();
      });
    }

    filter();
  }

  window.LiuChangPlayer = {
    bind: function (videoId, buttonId, url) {
      ready(function () {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hls = null;
        var prepared = false;

        if (!video || !button || !url) {
          return;
        }

        function prepare() {
          if (prepared) {
            return;
          }

          prepared = true;

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
          } else {
            video.src = url;
          }
        }

        function start() {
          prepare();
          button.classList.add("is-hidden");
          var promise = video.play();

          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              button.classList.remove("is-hidden");
            });
          }
        }

        button.addEventListener("click", start);

        video.addEventListener("click", function () {
          if (!prepared || video.paused) {
            start();
          } else {
            video.pause();
          }
        });

        video.addEventListener("play", function () {
          button.classList.add("is-hidden");
        });

        video.addEventListener("ended", function () {
          button.classList.remove("is-hidden");
        });

        window.addEventListener("beforeunload", function () {
          if (hls) {
            hls.destroy();
          }
        });
      });
    }
  };

  ready(function () {
    initMenu();
    initBackToTop();
    initHero();
    initSearch();
  });
})();
