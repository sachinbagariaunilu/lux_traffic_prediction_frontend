"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

/**
 * Reveals children once they scroll into view. IntersectionObserver rather than
 * a scroll listener, so it costs nothing while idle, and it unobserves after
 * firing -- these play once, not every time you scroll past.
 *
 * Reduced motion is handled in CSS (globals.css forces .reveal visible), so
 * there is deliberately no media-query branch here: that would mean setting
 * state synchronously inside the effect, which cascades an extra render.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as ElementType;

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
