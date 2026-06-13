(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        const next = hero.querySelector('[data-hero-next]');
        const prev = hero.querySelector('[data-hero-prev]');
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const filterInputs = Array.from(document.querySelectorAll('.card-filter'));

    filterInputs.forEach(function (input) {
        const section = input.closest('.content-section') || document;
        const yearSelect = section.querySelector('.year-filter');
        const cards = Array.from(section.querySelectorAll('.filter-grid .movie-card'));

        const applyFilter = function () {
            const keyword = input.value.trim().toLowerCase();
            const year = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                const matchesText = !keyword || haystack.indexOf(keyword) !== -1;
                const matchesYear = !year || (card.getAttribute('data-year') || '').indexOf(year) !== -1;
                card.classList.toggle('hidden-by-filter', !(matchesText && matchesYear));
            });
        };

        input.addEventListener('input', applyFilter);
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
    });

    const loadHlsLibrary = function () {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
        const video = box.querySelector('video');
        const button = box.querySelector('.play-panel');
        const stream = box.getAttribute('data-stream');
        let started = false;
        let hlsInstance = null;

        const playVideo = function () {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    box.classList.remove('playing');
                });
            }
        };

        const start = async function () {
            if (!video || !stream) {
                return;
            }
            box.classList.add('playing');
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                playVideo();
                return;
            }
            try {
                const HlsConstructor = await loadHlsLibrary();
                if (HlsConstructor && HlsConstructor.isSupported()) {
                    hlsInstance = new HlsConstructor({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, playVideo);
                    hlsInstance.on(HlsConstructor.Events.ERROR, function () {
                        if (video.paused) {
                            box.classList.remove('playing');
                        }
                    });
                } else {
                    video.src = stream;
                    playVideo();
                }
            } catch (error) {
                video.src = stream;
                playVideo();
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    box.classList.remove('playing');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });

    const searchInput = document.getElementById('siteSearchInput');
    const searchButton = document.getElementById('siteSearchButton');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults && Array.isArray(window.siteSearchIndex)) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        searchInput.value = initial;

        const renderResults = function () {
            const query = searchInput.value.trim().toLowerCase();
            const words = query.split(/\s+/).filter(Boolean);
            const results = window.siteSearchIndex.filter(function (movie) {
                if (!words.length) {
                    return false;
                }
                const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category].join(' ').toLowerCase();
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 80);

            searchResults.innerHTML = results.map(function (movie) {
                return '<a class="search-result-card" href="' + movie.url + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<div><h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p>' + escapeHtml([movie.region, movie.year, movie.type, movie.category].filter(Boolean).join(' · ')) + '</p>' +
                    '<p>' + escapeHtml([movie.genre, movie.tags].filter(Boolean).join(' · ')) + '</p></div>' +
                    '</a>';
            }).join('');
        };

        const escapeHtml = function (value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        searchInput.addEventListener('input', renderResults);
        if (searchButton) {
            searchButton.addEventListener('click', renderResults);
        }
        if (initial) {
            renderResults();
        }
    }
})();
