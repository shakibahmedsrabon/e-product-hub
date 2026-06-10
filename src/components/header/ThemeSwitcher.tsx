import { useTheme, type Theme } from "@/hooks/useTheme";
import { Sun, Moon, Palette, Waves } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "auto", label: "System", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "cyan-crimson", label: "Cyan Purple", Icon: Palette },
  { value: "teal-slate", label: "Teal Slate", Icon: Waves },
];

const ThemeSwitcher = () => {
  const { theme, setTheme, resolvedScheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];
  const ActiveIcon =
    theme === "auto" ? (resolvedScheme === "dark" ? Moon : Sun) : Current.Icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
        aria-label={`Theme: ${Current.label}. Click to change`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${Current.label}`}
      >
        <ActiveIcon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Theme selector"
          className="absolute right-0 mt-2 w-44 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-50 animate-fade-in"
        >
          {OPTIONS.map(({ value, label, Icon }) => {
            const active = value === theme;
            return (
              <button
                key={value}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-light text-left transition-colors duration-150 ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-popover-foreground hover:bg-accent/60"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
