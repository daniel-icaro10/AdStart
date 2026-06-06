"use client";

import * as React from "react";

/**
 * Efeito de inclinação 3D sutil seguindo o cursor (estilo Notion/premium).
 * Aplica `transform` inline no elemento referenciado. Respeita
 * prefers-reduced-motion (não inclina nesse caso).
 */
export function useTilt<T extends HTMLElement>(maxDeg = 6) {
  const ref = React.useRef<T>(null);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const onMouseMove = React.useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el || reduceMotion) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height; // 0..1
      const rx = (0.5 - py) * maxDeg * 2;
      const ry = (px - 0.5) * maxDeg * 2;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    },
    [maxDeg, reduceMotion],
  );

  const onMouseLeave = React.useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
