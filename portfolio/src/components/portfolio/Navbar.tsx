import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { profile } from "@/data/portfolio";

export type SectionKey = "universe" | "about" | "works" | "contact";

export const navItems: { key: SectionKey; label: string }[] = [
  { key: "universe", label: "The Universe" },
  { key: "about", label: "About Me" },
  { key: "works", label: "Featured Works" },
  { key: "contact", label: "Control Room" },
];

export function Navbar({
  active,
  onChange,
}: {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => onChange("universe")}
            className="flex items-center gap-3 font-mono text-sm uppercase tracking-[0.25em] text-foreground"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/50 bg-primary/15 font-display text-base italic">
              {profile.name.charAt(0)}
            </span>
            {profile.name}
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.slice(1).map((item) => (
              <NavButton
                key={item.key}
                label={item.label}
                isActive={active === item.key}
                onClick={() => onChange(item.key)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Exit
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-5 py-3">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onChange(item.key);
                    setOpen(false);
                  }}
                  className={cn(
                    "py-3 text-left font-mono text-xs uppercase tracking-[0.2em] transition-colors",
                    active === item.key
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute inset-x-3 -bottom-px h-px bg-primary"
        />
      )}
    </button>
  );
}