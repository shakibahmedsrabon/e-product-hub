/**
 * HeroSlider — Samsung-style GPU-accelerated full-bleed image carousel.
 * Images are fetched from the "Sliders" table (column: images).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Slide {
  id: number | string;
  image: string;
  alt: string;
}

const VIDEO_RE = /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i;
const isVideoUrl = (url: string) => VIDEO_RE.test(url);

const AUTO_PLAY_INTERVAL = 5000;
const TRANSITION_DURATION = 600;
// Smooth, gentle ease for a calmer slide change
const EASE_SNAPPY = "cubic-bezier(0.65, 0, 0.35, 1)";

const HeroSlider = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Tracks how many slides have been allowed to begin loading. Loads sequentially
  // so the browser doesn't try to fetch every hero image at once on first paint.
  const [loadedCount, setLoadedCount] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef(0);
  const touchDeltaRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Two-stage fetch: first slide arrives fast (LCP-optimized), rest streams in.
  useEffect(() => {
    let mounted = true;
    const seen = new Set<string>();

    // Stage 1: fetch only the first slide for a fast paint
    (async () => {
      const { data: firstRows } = await supabase
        .from("Sliders" as any)
        .select("id, images")
        .order("id", { ascending: true })
        .limit(1);

      if (!mounted || !firstRows) return;
      const first = (firstRows as unknown as { id: number; images: string | null }[])
        .filter((r) => r.images && r.images.trim().length > 0)
        .map((r) => ({ id: r.id, image: r.images!.trim(), alt: "Featured slide" }));

      first.forEach((s) => seen.add(s.image));
      if (first.length > 0) {
        setSlides(first);
        setCurrent(0);
      }

      // Stage 2: fetch the remaining slides
      const { data: rest } = await supabase
        .from("Sliders" as any)
        .select("id, images")
        .order("id", { ascending: true })
        .range(1, 20);

      if (!mounted || !rest) return;
      const more = (rest as unknown as { id: number; images: string | null }[])
        .filter((r) => r.images && r.images.trim().length > 0)
        .map((r) => ({ id: r.id, image: r.images!.trim(), alt: "Featured slide" }))
        .filter((s) => {
          if (seen.has(s.image)) return false;
          seen.add(s.image);
          return true;
        });

      if (more.length > 0) setSlides((prev) => [...prev, ...more]);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const total = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || total === 0) return;
      if (index < 0 || index >= total) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
    },
    [isTransitioning, total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!isPlaying || total <= 1) return;
    // Stop autoplay at the last slide (no loop)
    if (current >= total - 1) return;
    timerRef.current = setTimeout(next, AUTO_PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, current, next, total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    touchDeltaRef.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaRef.current = e.touches[0].clientX - touchStartRef.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(touchDeltaRef.current) > 50) {
      touchDeltaRef.current < 0 ? next() : prev();
    }
  };

  if (slides.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden select-none mb-8 md:mb-12 bg-muted/20 aspect-[16/10] sm:aspect-[16/9] md:aspect-[2.86/1] -mt-16"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {slides.map((slide, i) => {
        const isActive = i === current;
        // Sequential loading: only render slides up to loadedCount.
        const shouldRender = i < loadedCount;
        const isVideo = isVideoUrl(slide.image);
        return (
          <div
            key={slide.id}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              transition: `opacity ${TRANSITION_DURATION}ms ${EASE_SNAPPY}`,
              zIndex: isActive ? 2 : 1,
              willChange: "opacity",
              pointerEvents: isActive ? "auto" : "none",
            }}
            aria-hidden={!isActive}
          >
            {shouldRender && (
              isVideo ? (
                <video
                  src={slide.image}
                  autoPlay={isActive}
                  muted
                  loop
                  playsInline
                  preload={i === 0 ? "auto" : "metadata"}
                  onLoadedData={() =>
                    setLoadedCount((c) => (i + 1 >= c ? Math.min(c + 1, slides.length) : c))
                  }
                  onError={() =>
                    setLoadedCount((c) => (i + 1 >= c ? Math.min(c + 1, slides.length) : c))
                  }
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  onLoad={() =>
                    setLoadedCount((c) => (i + 1 >= c ? Math.min(c + 1, slides.length) : c))
                  }
                  onError={() =>
                    setLoadedCount((c) => (i + 1 >= c ? Math.min(c + 1, slides.length) : c))
                  }
                  className="w-full h-full object-cover pointer-events-none"
                />
              )
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        );
      })}

      {total > 1 && (
        <>
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-2 px-4 md:px-6 pb-2 md:pb-3">
            {/* Left spacer to balance the right play/pause button */}
            <div className="w-7 h-7" />

            {/* Center: Prev + dots + Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={current === 0}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="relative flex items-center justify-center p-1"
                  >
                    <span
                      className={cn(
                        "block rounded-full",
                        i === current
                          ? "w-2.5 h-2.5 bg-white"
                          : "w-2 h-2 border border-white/50 bg-transparent hover:border-white"
                      )}
                      style={{
                        willChange: "transform",
                        transition:
                          "width 400ms cubic-bezier(0.34,1.56,0.64,1), height 400ms cubic-bezier(0.34,1.56,0.64,1), background-color 300ms ease, border-color 300ms ease, transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
                        transform: i === current ? "scale(1)" : "scale(0.85)",
                      }}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={next}
                disabled={current === total - 1}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 disabled:opacity-0 disabled:pointer-events-none"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Right: Play / Pause */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Play className="w-3.5 h-3.5" strokeWidth={1.5} />}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
