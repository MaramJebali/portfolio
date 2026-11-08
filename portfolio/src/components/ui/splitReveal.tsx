import { useTextReveal } from "@/hooks/useTextReveal";
import { cn } from "@/lib/utils";

type Props = {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  children: React.ReactNode;
  className?: string;
  type?: "chars" | "words" | "lines";
  stagger?: number;
  duration?: number;
  delay?: number;
};

export function SplitReveal({
  as: Tag = "div",
  children,
  className,
  type,
  stagger,
  duration,
  delay,
}: Props) {
  const ref = useTextReveal<HTMLElement>({ type, stagger, duration, delay });

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("will-change-transform", className)}
    >
      {children}
    </Tag>
  );
}