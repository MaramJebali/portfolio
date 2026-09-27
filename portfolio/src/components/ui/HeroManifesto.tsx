import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Word = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "manifesto-element font-sans inline-block mr-[0.18em] will-change-[transform,opacity,filter] leading-[1.15] origin-center",
      className,
    )}
  >
    {children}
  </span>
);

const FlippingImagePill = ({
  images,
  index = 0,
}: {
  images: string[];
  index?: number;
}) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const rotationTarget = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frontImgIdx = useRef(0);
  const backImgIdx = useRef(images.length > 1 ? 1 : 0);
  const [, setRenderKey] = useState(0);

  const triggerFlip = () => {
    rotationTarget.current += 180;
    gsap.to(innerRef.current, {
      rotateY: rotationTarget.current,
      duration: 1.15,
      ease: "back.inOut(1.4)",
      overwrite: "auto",
      onComplete: () => {
        const flips = Math.round(rotationTarget.current / 180);
        if (flips % 2 !== 0) {
          frontImgIdx.current = (backImgIdx.current + 1) % images.length;
        } else {
          backImgIdx.current = (frontImgIdx.current + 1) % images.length;
        }
        setRenderKey((k) => k + 1);
      },
    });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(triggerFlip, 5000);
  };

  useLayoutEffect(() => {
    timerRef.current = setTimeout(triggerFlip, (index * 0.7 + 2.5) * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  return (
    <span
      className={cn(
        "manifesto-element h-11 w-16 md:h-14 md:w-20 inline-block align-middle mx-[0.12em] relative will-change-[transform,opacity,filter]",
      )}
    >
      <div
        onMouseEnter={() => triggerFlip()}
        className="absolute inset-0 w-full h-full cursor-pointer rounded-full overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]"
        style={{ perspective: "900px" }}
      >
        <div
          ref={innerRef}
          className="w-full h-full relative origin-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            src={images[frontImgIdx.current]}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            alt=""
          />
          <img
            src={images[backImgIdx.current]}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            alt=""
          />
        </div>
      </div>
    </span>
  );
};

const TextPill = ({
  text,
  className,
  magic = false,
}: {
  text: string;
  className?: string;
  magic?: boolean;
}) => (
  <span
    className={cn(
      "manifesto-element inline-flex h-11 md:h-14 items-center whitespace-nowrap align-middle mx-[0.12em] px-[0.9em] rounded-full font-sans font-bold leading-none tracking-tight will-change-[transform,opacity,filter] border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(0,0,0,0.7)] text-[0.62em]",
      className,
    )}
  >
    <span className={cn(magic ? "magic-text" : "text-magic-parchment")}>
      {text}
    </span>
  </span>
);

interface HeroManifestoProps {
  name?: string;
  role?: string;
  location?: string;
  tagline?: string;
  introImages?: string[];
  engineerImages?: string[];
  tunisiaImages?: string[];
}

export const HeroManifesto = ({
  name = "Maram",
  role = "AI Engineering Student",
  location = "Tunisia",
  tagline = "Building full-stack AI solutions.",
  introImages = [],
  engineerImages = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&h=200",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&h=200",
  ],
  tunisiaImages = [
    "https://images.pexels.com/photos/35347791/pexels-photo-35347791.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    "https://images.pexels.com/photos/15965246/pexels-photo-15965246.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
  ],
}: HeroManifestoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedIntro =
    introImages.length > 0 ? introImages : [engineerImages[0]];

  useLayoutEffect(() => {
    let ctx: gsap.Context;
    const elements =
      containerRef.current?.querySelectorAll(".manifesto-element") || [];

    gsap.set(elements, {
      y: 32,
      opacity: 0,
      filter: "blur(12px)",
      scale: 0.96,
    });

    const startAnimation = () => {
      ctx = gsap.context(() => {
        gsap.to(elements, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 1.05,
          stagger: 0.045,
          ease: "power3.out",
          delay: 0.15,
        });
      }, containerRef);
    };

    let observer: IntersectionObserver | undefined;
    let fallback: number | undefined;

    if (containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer?.disconnect();
            if (fallback) window.clearTimeout(fallback);
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(containerRef.current);
    }

    fallback = window.setTimeout(startAnimation, 2500);

    return () => {
      observer?.disconnect();
      if (fallback) window.clearTimeout(fallback);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center justify-center text-center"
    >
      <h1 className="font-sans text-[clamp(2rem,3.2vw,3.1rem)] leading-[1.5] md:leading-[1.4] font-bold tracking-[-0.02em] text-magic-parchment max-w-5xl mx-auto">
        <Word>Hi,</Word>
        <Word>I&apos;m</Word>
        <FlippingImagePill images={resolvedIntro} index={0} />
        <TextPill text={name} magic />

        <br className="hidden md:block" />

        <Word>a</Word>
        <FlippingImagePill images={engineerImages} index={1} />
        <TextPill text={role} magic className="mr-1 md:mr-2" />

        <Word>from</Word>
        <FlippingImagePill images={tunisiaImages} index={2} />
        <TextPill text={location} magic />

        <br className="hidden md:block" />

        <Word className="block mt-4 md:mt-4 text-magic-parchment/85 font-bold">
          {tagline}
        </Word>
      </h1>
    </section>
  );
};