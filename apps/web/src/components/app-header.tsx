import Link from "next/link";
import { Github } from "lucide-react";

const navItems = [
  { href: "/skills", label: "Skills" },
  { href: "/authors", label: "Authors" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-8 px-5">
        <Link href="/skills" className="flex items-center gap-3" aria-label="PapiSkill home">
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
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/docs/cli"
            className="hidden rounded-md border border-border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:block"
          >
            CLI
          </Link>
          <Link
            href="/api/auth/sign-in/github"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-3.5 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-50"
          >
            <Github className="size-4" aria-hidden />
            Sign in with GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}
