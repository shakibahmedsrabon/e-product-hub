document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.querySelector('.sliders.embla__viewport');
  const container = viewport?.querySelector('.embla__container');
  if (!viewport || !container || typeof EmblaCarousel !== 'function') return;

  // Make each direct child of the container an Embla slide
  Array.from(container.children).forEach((child) => {
    child.classList.add('embla__slide');
  });

  // Pure swipe/drag setup (no autoplay, no buttons)
  EmblaCarousel(viewport, {
    loop: true,
    align: 'start',
    skipSnaps: false
  });
});
