"use client";

import { useEffect, useRef } from "react";

export default function WaFx({ label }: { label: string }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const toast = toastRef.current;
    if (!layer || !toast) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="https://wa.me/"]',
      );
      if (!target) return;

      target.classList.add("is-tapped");
      window.setTimeout(() => target.classList.remove("is-tapped"), 520);

      if (!reduced) {
        const ripple = document.createElement("span");
        ripple.className = "wa-ripple";
        ripple.style.left = `${event.clientX}px`;
        ripple.style.top = `${event.clientY}px`;
        layer.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 900);

        const rect = target.getBoundingClientRect();
        const pulse = document.createElement("span");
        pulse.className = "wa-pulse";
        pulse.style.left = `${rect.left + rect.width / 2}px`;
        pulse.style.top = `${rect.top + rect.height / 2}px`;
        layer.appendChild(pulse);
        window.setTimeout(() => pulse.remove(), 950);
      }

      toast.textContent = label;
      toast.dataset.show = "true";
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        toast.dataset.show = "false";
      }, 2400);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [label]);

  return (
    <>
      <div ref={layerRef} className="wa-layer" aria-hidden="true" />
      <div ref={toastRef} className="wa-toast" role="status" aria-live="polite" />
    </>
  );
}
