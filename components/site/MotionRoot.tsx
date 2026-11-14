"use client";

import { useEffect } from "react";

export default function MotionRoot() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const revealAll = () => els.forEach((el) => el.classList.add("is-in"));

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    els.forEach((el) => io.observe(el));

    const fallback = window.setTimeout(() => {
      const hidden = els.filter((el) => !el.classList.contains("is-in"));
      if (hidden.length === els.length) revealAll();
    }, 4000);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
