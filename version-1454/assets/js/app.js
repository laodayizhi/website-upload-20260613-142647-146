(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot) {
                dot.classList.toggle('is-active', Number(dot.getAttribute('data-hero-dot')) === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var list = document.querySelector('[data-card-list]');
        var empty = document.querySelector('[data-empty-state]');
        var search = panel.querySelector('[data-filter-search]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');

        if (!list || !search) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            search.value = q;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' '));
        }

        function applyFilter() {
            var keyword = normalize(search.value);
            var typeValue = normalize(type ? type.value : '');
            var yearValue = normalize(year ? year.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var show = matchesKeyword && matchesType && matchesYear;

                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        search.addEventListener('input', applyFilter);

        if (type) {
            type.addEventListener('change', applyFilter);
        }

        if (year) {
            year.addEventListener('change', applyFilter);
        }

        applyFilter();
    });
})();
