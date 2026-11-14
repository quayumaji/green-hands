"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger index inside a group (each step adds 70 ms). */
  index?: number;
  id?: string;
  [prop: string]: unknown;
}

/**
 * Fades content in with a soft blur as it scrolls into view. One IntersectionObserver
 * is shared by every instance; elements are unobserved as soon as they appear.
 */
let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          callbacks.get(entry.target)?.();
          callbacks.delete(entry.target);
          observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
  }
  return observer;
}

export function Reveal({ children, as: Tag = "div", className = "", index = 0, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = getObserver();
    if (reduce || !io) {
      el.classList.add("is-visible");
      return;
    }
    const show = () => el.classList.add("is-visible");
    callbacks.set(el, show);
    io.observe(el);
    // Safety net: if the observer never fires (background tab, print, odd embeds), reveal anyway.
    const fallback = window.setTimeout(show, 2500);
    return () => {
      window.clearTimeout(fallback);
      callbacks.delete(el);
      io.unobserve(el);
    };
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()} style={{ "--reveal-delay": `${Math.min(index, 5) * 70}ms` } as React.CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}
