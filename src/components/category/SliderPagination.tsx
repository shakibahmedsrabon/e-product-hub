import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

interface SliderPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SliderPagination = ({ currentPage, totalPages, onPageChange }: SliderPaginationProps) => {
  // Build compact page list with ellipsis (Samsung-style)
  const pages = useMemo(() => {
    const items: (number | "...")[] = [];
    const add = (n: number | "...") => items.push(n);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
    } else {
      add(1);
      if (currentPage > 3) add("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) add(i);
      if (currentPage < totalPages - 2) add("...");
      add(totalPages);
    }
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange(p);
    // Smooth scroll to top of grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Slider indicator math (Samsung-inspired: thin track + animated thumb)
  const thumbWidth = 100 / totalPages;
  const thumbLeft = (currentPage - 1) * thumbWidth;

  return (
    <section className="w-full px-6 py-10">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
        {/* Samsung-style slider track */}
        <div className="w-full relative h-[2px] bg-border/60 overflow-hidden rounded-full">
          <div
            className="absolute top-0 h-full bg-foreground rounded-full will-change-transform"
            style={{
              width: `${thumbWidth}%`,
              transform: `translateX(${thumbLeft / thumbWidth * 100}%)`,
              transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), width 400ms ease",
            }}
          />
        </div>

        {/* Page label */}
        <div className="text-xs font-light tracking-[0.2em] uppercase text-muted-foreground">
          Page {currentPage} <span className="mx-2 opacity-40">/</span> {totalPages}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => go(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-2 -ml-2 transition-opacity duration-200 hover:opacity-50 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {pages.map((p, idx) =>
              p === "..." ? (
                <span
                  key={`e-${idx}`}
                  className="mx-1 text-sm font-light text-muted-foreground select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => go(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`min-w-8 h-8 text-sm transition-all duration-300 ${
                    p === currentPage
                      ? "font-normal underline underline-offset-4"
                      : "font-light hover:underline underline-offset-4 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => go(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-2 -mr-2 transition-opacity duration-200 hover:opacity-50 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SliderPagination;
