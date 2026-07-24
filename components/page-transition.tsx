"use client";

import { usePathname } from "next/navigation";

/**
 * Membungkus isi halaman dengan animasi masuk (fade + naik). Di-key dengan
 * pathname supaya animasinya diputar ulang setiap kali pindah halaman, jadi
 * perpindahan terasa mulus, bukan berganti mendadak.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
