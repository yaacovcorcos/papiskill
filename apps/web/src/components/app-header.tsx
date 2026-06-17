import Link from "next/link";
import { HeaderAccountSlot } from "./header-account-slot";

const navItems = [
  { href: "/skills", label: "Skills" },
  { href: "/authors", label: "Authors" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppHeader() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-6 px-4 sm:gap-8 sm:px-5">
          <Link href="/skills" prefetch={false} className="focus-ring flex items-center gap-3 rounded-md" aria-label="PapiSkill home">
            <span className="grid size-9 place-items-center rounded-lg bg-[#111318] font-mono text-sm font-semibold text-white">
              PS
            </span>
            <span className="text-xl font-semibold tracking-tight">PapiSkill</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/docs/cli"
              prefetch={false}
              className="focus-ring hidden rounded-md border border-border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:block"
            >
              CLI
            </Link>
            <HeaderAccountSlot />
          </div>
        </div>
      </header>
      <span id="main-content" tabIndex={-1} className="sr-only">
        Main content
      </span>
    </>
  );
}
