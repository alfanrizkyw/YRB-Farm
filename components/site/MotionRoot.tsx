"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("js");

    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    reveals.forEach((el) => {
      el.dataset.from = el.getBoundingClientRect().top < 0 ? "top" : "bottom";
    });

    const reveal = (el: HTMLElement) => {
      if (!el.dataset.from) el.dataset.from = "bottom";
      el.classList.add("is-in");
    };

    let io: IntersectionObserver | null = null;
    let reset: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
          }
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
      );

      // re-arm once an element has fully left the viewport, so the next entry
      // replays the reveal instead of showing a static block
      reset = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            if (!el.classList.contains("is-in")) continue;
            el.classList.remove("is-in");
            el.dataset.from = entry.boundingClientRect.top > 0 ? "bottom" : "top";
          }
        },
        { threshold: 0 },
      );

      reveals.forEach((el) => {
        io?.observe(el);
        reset?.observe(el);
      });
    } else {
      reveals.forEach(reveal);
    }

    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let lastY = window.scrollY;
    let direction: "down" | "up" = "down";
    let headerHidden = false;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      if (Math.abs(delta) > 3) {
        direction = delta > 0 ? "down" : "up";
        root.dataset.scrollDir = direction;
      }

      root.dataset.scrolled = y > 16 ? "true" : "false";

      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--progress", String(max > 0 ? Math.min(1, y / max) : 0));

      if (y > 560 && delta > 4 && !headerHidden) {
        root.dataset.head = "hidden";
        headerHidden = true;
      } else if ((delta < -4 || y < 160) && headerHidden) {
        root.dataset.head = "shown";
        headerHidden = false;
      }

      if (!reduced) {
        for (const el of parallax) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -160 || rect.top > window.innerHeight + 160) continue;
          const speed = Number(el.dataset.parallax) || 0.08;
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
          el.style.setProperty("--parallax", `${offset.toFixed(1)}px`);
        }
      }

      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const fallback = window.setTimeout(() => {
      const hidden = reveals.filter((el) => !el.classList.contains("is-in"));
      if (hidden.length === reveals.length) reveals.forEach(reveal);
    }, 3500);

    return () => {
      io?.disconnect();
      reset?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(fallback);
    };
  }, [pathname]);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span />
    </div>
  );
}
