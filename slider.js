document.addEventListener('DOMContentLoaded', () => {
  const overview = document.querySelector('.overview');
  if (overview) {
    const overviewParts = Array.from(overview.querySelectorAll('h1, h2, .text'));
    if (overviewParts.length) {
      overviewParts.forEach((node, index) => node.style.setProperty('--child-index', String(index)));
      const prefersReduced = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced && !overview.classList.contains('overview--fx')) {
        overview.classList.add('overview--fx');
        const launchOverview = () => overview.classList.add('overview--animated');
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => requestAnimationFrame(launchOverview));
        } else {
          setTimeout(launchOverview, 60);
        }
      }
    }
  }


  const viewport = document.querySelector('.sliders.embla__viewport');
  const container = viewport?.querySelector('.embla__container');
  if (!viewport || !container || typeof EmblaCarousel !== 'function') return;

  const slides = Array.from(container.children);
  if (!slides.length) return;

  const sliderRoot = viewport.closest('.slider-container');
  const scaleRoot = sliderRoot || document.body;

  // Make each direct child of the container an Embla slide
  slides.forEach((child, index) => {
    child.classList.add('embla__slide');
    child.style.setProperty('--slide-index', String(index));
  });

  if (sliderRoot && !sliderRoot.classList.contains('slider--fx')) {
    sliderRoot.classList.add('slider--fx');
    const startAnimation = () => sliderRoot.classList.add('slider--animated');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => requestAnimationFrame(startAnimation));
    } else {
      setTimeout(startAnimation, 50);
    }
  }

  const cards = slides.map((slide) => slide.querySelector('.slider'));

  let baseScale = 1;
  let minScale = 1;
  let scaleFactor = 0;
  const BASE_SCALE_FACTOR = 0.25;

  const computeScales = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const enableScaling = viewportWidth <= 768;
    const rootStyle = scaleRoot ? getComputedStyle(scaleRoot) : null;
    const declared = rootStyle ? parseFloat(rootStyle.getPropertyValue('--slider-scale-default')) : NaN;
    if (enableScaling) {
      const fallback = 0.9;
      const safe = Number.isFinite(declared) ? declared : fallback;
      baseScale = Math.min(Math.max(safe, 0.75), 1);
      minScale = Math.max(baseScale - 0.06, 0.75);
      scaleFactor = BASE_SCALE_FACTOR;
    } else {
      baseScale = 1;
      minScale = 1;
      scaleFactor = 0;
    }
  };

  computeScales();

  const slidesCount = container.children.length;
  const startIndex = slidesCount ? Math.floor(slidesCount / 2) : 0;

  // Pure swipe/drag setup (no autoplay, no buttons)
  const embla = EmblaCarousel(viewport, {
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps',
    inViewThreshold: 0.75,
    slidesToScroll: 1,
    dragFree: false,
    speed: 6,
    startIndex
  });

  const applySlideState = () => {
    if (!slides.length) return;
    const snaps = embla.scrollSnapList();
    if (!snaps.length) return;
    const progress = embla.scrollProgress();

    const diffs = slides.map((_, index) => {
      const snap = snaps[index] ?? snaps[snaps.length - 1] ?? 0;
      return Math.min(Math.abs(progress - snap), 1);
    });

    let activeIndex = 0;
    let minDiff = diffs[0] ?? Infinity;
    diffs.forEach((diff, index) => {
      if (diff < minDiff) {
        minDiff = diff;
        activeIndex = index;
      }
    });

    slides.forEach((slide, index) => {
      const card = cards[index];
      if (!card) return;
      const diff = diffs[index] ?? 1;
      const scale = index === activeIndex
        ? 1
        : scaleFactor
          ? Math.min(Math.max(1 - diff * scaleFactor, minScale), baseScale)
          : baseScale;
      card.style.setProperty('--slide-scale', scale.toFixed(3));
      slide.classList.toggle('is-active', index === activeIndex);
    });
  };

  embla.on('scroll', applySlideState);
  embla.on('select', applySlideState);
  embla.on('reInit', () => {
    computeScales();
    slides.forEach((slide, index) => {
      slide.style.setProperty('--slide-index', String(index));
    });
    embla.scrollTo(embla.selectedScrollSnap(), true);
    applySlideState();
  });

  embla.scrollTo(startIndex, true);
  applySlideState();

  Array.from(container.querySelectorAll('a')).forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!embla.clickAllowed()) {
        event.preventDefault();
      }
    });
  });
});
