(function () {
  const root = document.querySelector(".slider-container");
  if (!root) return;

  function ensureEmblaMarkup() {
    if (root.querySelector(".embla__container")) return;
    root.classList.add("embla");
    const track = document.createElement("div");
    track.className = "embla__container";
    Array.from(root.children).forEach((el) => {
      if (el.nodeType === 1) {
        el.classList.add("embla__slide");
        track.appendChild(el);
      }
    });
    root.appendChild(track);
  }

  const track = () => root.querySelector(".embla__container");

  function gapPx() {
    const cs = getComputedStyle(track());
    return parseFloat(cs.gap || cs.columnGap || "0") || 0;
  }

  function sideSpacePx() {
    const first = track()?.children?.[0];
    if (!first) return 0;
    const slideW = Math.round(first.getBoundingClientRect().width);
    const rootW  = Math.round(root.clientWidth);
    return Math.max(0, Math.round((rootW - slideW) / 2 + gapPx() / 2));
  }

  function clearEdgeMargins(animated) {
    const t = track();
    if (!t) return;
    if (animated) t.classList.add("edge-anim");
    else t.classList.remove("edge-anim");
    t.style.marginLeft = "0px";
    t.style.marginRight = "0px";
  }

  function updateEdgeMargins(index, last, animated) {
    const t = track();
    if (!t) return;
    const side = sideSpacePx();

    if (animated) t.classList.add("edge-anim");
    else t.classList.remove("edge-anim");

    if (index === 0) {
      t.style.marginLeft = side + "px";
      t.style.marginRight = "0px";
    } else if (index === last) {
      t.style.marginLeft = "0px";
      t.style.marginRight = side + "px";
    } else {
      t.style.marginLeft = "0px";
      t.style.marginRight = "0px";
    }
  }

  function hasOverflow() {
    const t = track();
    return t.scrollWidth > root.clientWidth + 1;
  }

  let embla;

  function initEmbla() {
    if (embla) { embla.reInit(); onSelect(false); return; }

    embla = EmblaCarousel(root, {
      align: "center",
      dragFree: false,
      skipSnaps: false,
      containScroll: "keepSnaps",
      inViewThreshold: 0.6
    });

    const snapToSelected = () => embla.scrollTo(embla.selectedScrollSnap(), false);

    function onSelect(animated) {
      const i = embla.selectedScrollSnap();
      const last = embla.scrollSnapList().length - 1;
      updateEdgeMargins(i, last, animated);
      requestAnimationFrame(() => snapToSelected());
    }

    onSelect(false);

    embla.on("select", () => onSelect(true));
    embla.on("pointerUp", () => {
      requestAnimationFrame(() => onSelect(true));
    });
    embla.on("resize", () => {
      // avoid animating during resize recalcs
      onSelect(false);
      embla.reInit();
      requestAnimationFrame(() => onSelect(false));
    });
  }

  function destroyEmbla() {
    if (!embla) return;
    embla.destroy();
    embla = undefined;
    clearEdgeMargins(false);
  }

  function refresh() {
    ensureEmblaMarkup();
    if (hasOverflow()) {
      root.classList.remove("no-embla");
      initEmbla();
    } else {
      destroyEmbla();
      root.classList.add("no-embla");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh, { once: true });
  } else {
    refresh();
  }

  root.querySelectorAll("img").forEach((img) =>
    img.addEventListener("load", () => {
      if (embla) { embla.reInit(); requestAnimationFrame(() => embla.scrollTo(embla.selectedScrollSnap(), false)); }
    })
  );

  const ro = new ResizeObserver(() => {
    if (embla) {
      // no animation on resize to prevent rubber-banding
      const i = embla.selectedScrollSnap();
      const last = embla.scrollSnapList().length - 1;
      updateEdgeMargins(i, last, false);
      embla.reInit();
      embla.scrollTo(i, false);
    }
    if (!hasOverflow()) {
      destroyEmbla();
      root.classList.add("no-embla");
    }
  });
  ro.observe(root);

  if (window.visualViewport) {
    visualViewport.addEventListener("resize", () => {
      if (embla) {
        const i = embla.selectedScrollSnap();
        const last = embla.scrollSnapList().length - 1;
        updateEdgeMargins(i, last, false);
        embla.reInit();
        embla.scrollTo(i, false);
      }
    });
  }
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      if (embla) {
        const i = embla.selectedScrollSnap();
        const last = embla.scrollSnapList().length - 1;
        updateEdgeMargins(i, last, false);
        embla.reInit();
        embla.scrollTo(i, false);
      }
    }, 150);
  });
})();