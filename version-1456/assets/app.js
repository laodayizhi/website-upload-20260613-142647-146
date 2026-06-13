(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        if (slides.length === 0) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        play();
    }

    function initSearch() {
        var fields = Array.prototype.slice.call(document.querySelectorAll('[data-search-field]'));
        fields.forEach(function (field) {
            field.addEventListener('input', function () {
                var query = field.value.trim().toLowerCase();
                var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
                });
            });
        });
    }

    function initPlayer() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var stream = shell.getAttribute('data-stream');
            var hlsInstance = null;
            if (!video || !overlay || !stream) {
                return;
            }

            function beginPlayback() {
                overlay.classList.add('is-hidden');
                video.controls = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    if (!video.src) {
                        video.src = stream;
                    }
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsInstance) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(stream);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    return;
                }

                if (!video.src) {
                    video.src = stream;
                }
                video.play().catch(function () {});
            }

            overlay.addEventListener('click', beginPlayback);
            video.addEventListener('click', function () {
                if (video.paused) {
                    beginPlayback();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayer();
    });
})();
