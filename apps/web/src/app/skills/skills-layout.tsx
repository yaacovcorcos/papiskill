"use client";

import type { ReactNode } from "react";

export function SkillsLayout({
  children,
  detail,
}: {
  children: ReactNode;
  detail: ReactNode;
}) {
  return (
    <main className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_430px]">
      {children}
      {detail}
    </main>
  );
}
