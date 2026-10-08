import React from "react";
import styled from "styled-components";

interface ButtonCVProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  text?: string;
  isLoading?: boolean;
  status?: "idle" | "downloading" | "done";
  /** Optional element after the label (e.g. a chevron when the button opens a menu). */
  trailing?: React.ReactNode;
  /** Class applied to the wrapper, not the <button>. */
  className?: string;
}

const ButtonCV = ({
  text = "Download CV",
  isLoading = false,
  status = "idle",
  trailing,
  className,
  disabled,
  ...rest
}: ButtonCVProps) => {
  const label =
    status === "downloading"
      ? "Downloading…"
      : status === "done"
        ? "Downloaded"
        : text;

  return (
    <StyledWrapper className={className}>
      <button
        type="button"
        {...rest}
        className={`button ${status === "done" ? "done" : ""}`}
        disabled={disabled || isLoading || status === "downloading"}
        aria-busy={isLoading || status === "downloading"}
      >
        <span className="dots_border" aria-hidden />
        <span className="sheen" aria-hidden />

        {/* Download arrow at rest, check mark once the file is saved */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="icon"
          aria-hidden="true"
        >
          {status === "done" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          ) : (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5"
              />
              <path
                className="arrow"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </>
          )}
        </svg>

        <span className="text_button">{label}</span>
        {trailing ? <span className="trailing">{trailing}</span> : null}
      </button>

      {/* Screen readers hear the state change; sighted users see the label */}
      <span className="sr-only" role="status" aria-live="polite">
        {status === "idle" ? "" : label}
      </span>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: inline-block;

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .button {
    --border_radius: 9999px;
    --transition: 0.3s cubic-bezier(0.22, 1, 0.36, 1);

    /* Galaxy palette */
    --nebula-1: #6366f1;
    --nebula-2: #a855f7;
    --nebula-3: #ec4899;
    --core-light: #ede9fe;

    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 44px; /* comfortable touch target */
    padding: 0.7rem 1.5rem;
    background-color: transparent;
    border: none;
    border-radius: var(--border_radius);
    color: white;
    isolation: isolate;
    transition: transform var(--transition);
  }

  .button:disabled {
    cursor: progress;
    opacity: 0.8;
  }

  /* Keyboard focus is clearly visible */
  .button:focus-visible {
    outline: 2px solid #e9d5ff;
    outline-offset: 3px;
  }

  /* ---------- Base surface ---------- */
  .button::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--border_radius);
    background-image: linear-gradient(
      180deg,
      rgba(10, 5, 36, 0.95) 0%,
      rgba(26, 11, 61, 0.95) 55%,
      rgba(60, 25, 120, 0.95) 100%
    );
    box-shadow:
      inset 0 0 0 1px rgba(168, 85, 247, 0.3),
      inset 0 0.5px 0 rgba(233, 213, 255, 0.15),
      inset 0 -1px 2px 0 rgba(0, 0, 0, 0.6),
      0 6px 20px -8px rgba(99, 102, 241, 0.55);
    transition: box-shadow var(--transition);
    z-index: 0;
  }

  /* ---------- Hover fill ---------- */
  .button::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--border_radius);
    background-image:
      radial-gradient(
        60% 120% at 15% 0%,
        rgba(233, 213, 255, 0.5) 0%,
        transparent 55%
      ),
      linear-gradient(
        120deg,
        var(--nebula-1) 0%,
        var(--nebula-2) 50%,
        var(--nebula-3) 100%
      );
    opacity: 0;
    transition: opacity var(--transition);
    z-index: 1;
  }

  .button:not(:disabled):is(:hover, :focus-visible)::after,
  .button.done::after {
    opacity: 1;
  }

  .button:not(:disabled):is(:hover, :focus-visible) {
    transform: translateY(-1px);
  }
  .button:not(:disabled):active {
    transform: scale(0.98);
  }

  /* ---------- Rotating ring: calm at rest, brighter on hover ---------- */
  .button .dots_border {
    position: absolute;
    inset: -1px;
    border-radius: var(--border_radius);
    overflow: hidden;
    padding: 1px;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
    z-index: 2;
    pointer-events: none;
  }

  .button .dots_border::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 220%;
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      var(--nebula-1) 40deg,
      var(--nebula-2) 120deg,
      var(--nebula-3) 200deg,
      transparent 260deg,
      transparent 360deg
    );
    animation: rotate 7s linear infinite;
    opacity: 0.45;
    transition: opacity var(--transition);
  }

  .button:not(:disabled):is(:hover, :focus-visible) .dots_border::before {
    opacity: 1;
  }

  @keyframes rotate {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  /* ---------- Top sheen ---------- */
  .button .sheen {
    position: absolute;
    inset: 0;
    border-radius: var(--border_radius);
    background: radial-gradient(
      80% 140% at 50% -30%,
      rgba(233, 213, 255, 0.28) 0%,
      transparent 60%
    );
    pointer-events: none;
    z-index: 3;
  }

  /* ---------- Icon ---------- */
  .button .icon {
    position: relative;
    z-index: 10;
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
    color: var(--core-light);
    transition: color var(--transition);
  }

  .button .icon .arrow {
    transition: transform var(--transition);
  }

  .button:not(:disabled):is(:hover, :focus-visible) .icon {
    color: #fff;
  }
  .button:not(:disabled):is(:hover, :focus-visible) .icon .arrow {
    transform: translateY(1.5px);
  }

  /* ---------- Label ---------- */
  .button .text_button {
    position: relative;
    z-index: 10;
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--core-light);
    transition: color var(--transition);
  }

  .button:not(:disabled):is(:hover, :focus-visible) .text_button,
  .button.done .text_button {
    color: #ffffff;
  }

  .button .trailing {
    position: relative;
    z-index: 10;
    display: inline-flex;
    color: var(--core-light);
  }

  /* ---------- Done state ---------- */
  .button.done {
    animation: pulse-done 1.2s ease-in-out 1;
  }

  @keyframes pulse-done {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.04);
    }
  }

  /* ---------- Reduced motion ---------- */
  @media (prefers-reduced-motion: reduce) {
    .button,
    .button::before,
    .button::after,
    .button .dots_border::before,
    .button .icon .arrow,
    .button.done {
      animation: none !important;
      transition: none !important;
    }
  }
`;

export default ButtonCV;