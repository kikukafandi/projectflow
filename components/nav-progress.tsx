"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Progress bar tipis di atas layar yang muncul di SETIAP navigasi internal —
 * tak peduli halamannya cepat atau lambat. Melengkapi loading.tsx (yang hanya
 * tampil saat halaman cukup lambat sehingga sempat suspend). Dependency-free:
 * mulai saat link internal diklik, selesai saat pathname benar-benar berganti.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }

  // Selesai saat pathname berganti (navigasi tuntas).
  useEffect(() => {
    clearTimers();
    setWidth(100);
    timers.current.push(
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 200),
    );
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Mulai saat sebuah link internal diklik.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (!a || !href || !href.startsWith("/") || a.getAttribute("target") === "_blank") return;
      if (href === pathname) return; // tujuan sama → tak ada navigasi
      clearTimers();
      setVisible(true);
      setWidth(8);
      timers.current.push(window.setTimeout(() => setWidth(75), 50));
      timers.current.push(window.setTimeout(() => setWidth(90), 500));
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-primary-soft"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 150ms" }}
      >
        <div
          className="h-full bg-primary shadow-[0_1px_8px_rgba(255,122,26,0.8)]"
          style={{ width: `${width}%`, transition: "width 300ms ease" }}
        />
      </div>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed left-1/2 top-3 z-[61] -translate-x-1/2 rounded-full border border-primary/20 bg-surface px-3 py-1 text-xs font-medium text-primary shadow-md"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translate(-50%, ${visible ? "0" : "-8px"})`,
          transition: "opacity 150ms, transform 150ms",
        }}
      >
        Memuat halaman…
      </div>
    </>
  );
}
