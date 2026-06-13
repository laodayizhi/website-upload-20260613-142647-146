(function () {
    var body = document.body;
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (button && nav) {
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            body.classList.toggle('menu-open', nav.classList.contains('is-open'));
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
        var input = panel.querySelector('[data-search-input]');
        var clearButton = panel.querySelector('[data-clear-search]');
        var filterButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
        var grid = panel.parentElement.querySelector('[data-movie-grid]');
        var activeValue = '';
        var empty = document.createElement('div');
        empty.className = 'empty-result';
        empty.textContent = '没有找到匹配的影片';

        if (!input || !grid) {
            return;
        }

        function textOf(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = textOf(card);
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedValue = !activeValue || haystack.indexOf(activeValue.toLowerCase()) !== -1;
                var show = matchedKeyword && matchedValue;
                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (visible === 0 && !empty.parentElement) {
                grid.appendChild(empty);
            }
            if (visible > 0 && empty.parentElement) {
                empty.parentElement.removeChild(empty);
            }
        }

        input.addEventListener('input', applyFilter);

        if (clearButton) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                activeValue = '';
                filterButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                if (filterButtons[0]) {
                    filterButtons[0].classList.add('is-active');
                }
                applyFilter();
                input.focus();
            });
        }

        filterButtons.forEach(function (item, index) {
            if (index === 0) {
                item.classList.add('is-active');
            }
            item.addEventListener('click', function () {
                activeValue = item.getAttribute('data-filter-value') || '';
                filterButtons.forEach(function (other) {
                    other.classList.toggle('is-active', other === item);
                });
                applyFilter();
            });
        });
    });
})();
