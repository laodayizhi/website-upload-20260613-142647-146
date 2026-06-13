
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-carousel");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-control.prev");
        var next = slider.querySelector(".hero-control.next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
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
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll(".filter-list"));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector(".filter-input");
        var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
        var empty = document.querySelector(".empty-state");
        var cards = [];
        lists.forEach(function (list) {
            cards = cards.concat(Array.prototype.slice.call(list.querySelectorAll(".movie-card")));
        });

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var filters = {};
            selects.forEach(function (select) {
                var key = select.getAttribute("data-filter");
                if (key) {
                    filters[key] = normalize(select.value);
                }
            });
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.textContent);
                var matched = !keyword || text.indexOf(keyword) !== -1;
                Object.keys(filters).forEach(function (key) {
                    if (!filters[key]) {
                        return;
                    }
                    var value = normalize(card.getAttribute("data-" + key));
                    if (value.indexOf(filters[key]) === -1) {
                        matched = false;
                    }
                });
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    function setupPlayer() {
        var shell = document.querySelector(".player-shell[data-stream]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var layer = shell.querySelector(".play-layer");
        var stream = shell.getAttribute("data-stream");
        var prepared = false;
        var hls = null;

        function prepare() {
            if (!video || prepared || !stream) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            prepare();
            if (layer) {
                layer.classList.add("hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (layer) {
                        layer.classList.remove("hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (layer) {
                    layer.classList.add("hidden");
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
