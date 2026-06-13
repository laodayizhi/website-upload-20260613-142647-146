const loadHlsLibrary = () => {
  return new Promise((resolve, reject) => {
    if (window.Hls) {
      resolve(window.Hls);
      return;
    }

    const existing = document.querySelector('script[data-hls-library]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Hls));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.dataset.hlsLibrary = 'true';
    script.addEventListener('load', () => resolve(window.Hls));
    script.addEventListener('error', reject);
    document.head.appendChild(script);
  });
};

const setupNavigation = () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
};

const setupHeroCarousel = () => {
  const carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const thumbs = Array.from(carousel.querySelectorAll('[data-hero-thumb]'));
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    thumbs.forEach((thumb, thumbIndex) => {
      thumb.classList.toggle('is-active', thumbIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => showSlide(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const index = Number(thumb.dataset.heroThumb || 0);
      showSlide(index);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  showSlide(0);
  start();
};

const normalize = (value) => {
  return String(value || '').trim().toLowerCase();
};

const setupGridFilter = () => {
  const input = document.querySelector('[data-grid-filter]');
  const grid = document.querySelector('[data-card-grid]');

  if (!input || !grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll('[data-card]'));

  input.addEventListener('input', () => {
    const keyword = normalize(input.value);

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year
      ].join(' '));

      card.classList.toggle('is-hidden', Boolean(keyword) && !haystack.includes(keyword));
    });
  });
};

const createSearchCard = (movie) => {
  return `
<article class="movie-card" data-card>
  <a href="${movie.url}" class="movie-card__link" aria-label="${movie.title}">
    <div class="movie-card__poster">
      <img src="${movie.image}" alt="${movie.title}" loading="lazy">
      <span class="movie-card__badge">${movie.type}</span>
    </div>
    <div class="movie-card__body">
      <h3>${movie.title}</h3>
      <p class="movie-card__meta">${movie.year} · ${movie.region} · ${movie.type}</p>
      <p class="movie-card__desc">${movie.oneLine}</p>
      <div class="movie-card__tags">
        <span>${movie.genre}</span>
        <span>${movie.tags}</span>
      </div>
    </div>
  </a>
</article>`.trim();
};

const setupSearchPage = () => {
  const input = document.querySelector('[data-search-input]');
  const button = document.querySelector('[data-search-button]');
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');

  if (!input || !button || !results || !status || !window.MOVIE_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  input.value = query;

  const render = () => {
    const keyword = normalize(input.value);
    const matched = window.MOVIE_INDEX.filter((movie) => {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' '));

      return !keyword || haystack.includes(keyword);
    }).slice(0, 120);

    if (!matched.length) {
      results.innerHTML = '';
      status.textContent = '未找到匹配内容';
      return;
    }

    results.innerHTML = matched.map(createSearchCard).join('');
    status.textContent = keyword ? `搜索结果：${input.value}` : '精选内容';
  };

  button.addEventListener('click', render);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      render();
    }
  });

  render();
};

const setupPlayer = () => {
  const shell = document.querySelector('[data-player-shell]');
  const video = document.querySelector('[data-video-player]');
  const button = document.querySelector('[data-play-button]');

  if (!shell || !video || !button) {
    return;
  }

  const source = video.dataset.hlsSource || video.querySelector('source')?.src;
  let initialized = false;

  const playVideo = async () => {
    if (!source) {
      return;
    }

    shell.classList.add('is-playing');

    if (!initialized) {
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        try {
          const Hls = await loadHlsLibrary();

          if (Hls && Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false
            });

            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        } catch (error) {
          video.src = source;
        }
      }
    }

    try {
      await video.play();
    } catch (error) {
      shell.classList.remove('is-playing');
    }
  };

  button.addEventListener('click', playVideo);
  video.addEventListener('click', () => {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', () => shell.classList.add('is-playing'));
  video.addEventListener('pause', () => {
    if (!video.ended) {
      shell.classList.remove('is-playing');
    }
  });
};

setupNavigation();
setupHeroCarousel();
setupGridFilter();
setupSearchPage();
setupPlayer();
