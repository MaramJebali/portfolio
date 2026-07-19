import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { X, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

type CertificationItem = {
  title: string;
  issuer: string;
  issued: string;
  credentialId: string;
};

export function CertificationModal({
  certifications,
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  certifications: CertificationItem[];
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const isOpen = currentIndex !== null;
  const total = certifications.length;
  const cert = isOpen ? certifications[currentIndex] : null;
  const image = isOpen ? images[currentIndex] ?? images[0] : null;

  const goPrev = () => {
    if (currentIndex === null) return;
    onNavigate((currentIndex - 1 + total) % total);
  };
  const goNext = () => {
    if (currentIndex === null) return;
    onNavigate((currentIndex + 1) % total);
  };

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (total <= 1) return;
    const swipeThreshold = 90;
    const velocityThreshold = 350;
    if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -velocityThreshold
    ) {
      goNext();
    } else if (
      info.offset.x > swipeThreshold ||
      info.velocity.x > velocityThreshold
    ) {
      goPrev();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex]);

  return (
    <AnimatePresence>
      {isOpen && cert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
        >
          {total > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card/80 p-2.5 text-muted-foreground backdrop-blur transition-colors hover:text-foreground sm:flex"
              aria-label="Previous certification"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            drag={total > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: "grabbing" }}
            className="scrollbar-thin relative max-h-[88vh] w-full max-w-2xl cursor-grab touch-pan-y overflow-y-auto rounded-t-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)] active:cursor-grabbing sm:rounded-3xl sm:p-9"
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-violet-glow">
                Credential {currentIndex! + 1} / {total}
              </span>
              
            </div>

            {image && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-border/40 bg-black/40">
                <img
                  src={image}
                  alt={cert.title}
                  className="h-auto max-h-[55vh] w-full object-contain"
                />
              </div>
            )}

            <h2 className="mt-6 font-display text-2xl leading-tight text-foreground sm:text-3xl">
              {cert.title}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-violet-glow" />
                {cert.issuer}
              </span>
              <span>{cert.issued}</span>
              <span className="text-muted-foreground/60">
                ID: {cert.credentialId}
              </span>
            </div>

            {total > 1 && (
              <div className="mt-8 flex items-center justify-between gap-3 sm:hidden">
                <button
                  onClick={goPrev}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  onClick={goNext}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-secondary"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>

          {total > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card/80 p-2.5 text-muted-foreground backdrop-blur transition-colors hover:text-foreground sm:flex"
              aria-label="Next certification"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}