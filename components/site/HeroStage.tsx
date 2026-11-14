"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  liveLabel: string;
  fallbackLabel: string;
  caption: string;
};

export default function HeroStage({ liveLabel, fallbackLabel, caption }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const lite =
      Boolean(nav.connection?.saveData) ||
      (nav.deviceMemory ?? 8) <= 4 ||
      (navigator.hardwareConcurrency ?? 8) <= 4;

    let disposed = false;
    let handle: { start: () => void; dispose: () => void } | null = null;

    const boot = async () => {
      try {
        const THREE = await import("three");
        const { buildPasture } = await import("./pasture");
        if (disposed) return;
        handle = buildPasture(THREE, canvas, host, { lite });
        handle.start();
        setReady(true);
        setLive(true);
      } catch (err) {
        console.warn("[hero] 3D scene unavailable", err);
      }
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(boot, { timeout: 1600 })
      : window.setTimeout(boot, 450);

    return () => {
      disposed = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
      handle?.dispose();
    };
  }, []);

  return (
    <figure className="stage" ref={hostRef}>
      <div className="stage-poster" aria-hidden="true">
        <i className="stage-sun" />
        <i className="stage-hill" />
        <i className="stage-hill stage-hill--b" />
        <i className="stage-hill stage-hill--c" />
      </div>
      <canvas ref={canvasRef} aria-hidden="true" data-ready={ready} />
      <span className="stage-tag">{live ? liveLabel : fallbackLabel}</span>
      <span className="stage-caption">{caption}</span>
    </figure>
  );
}
