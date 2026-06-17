"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, Library, LogOut, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { GithubSignInButton } from "./github-sign-in-button";

interface SignedOutAccount {
  signedIn: false;
}

interface SignedInAccount {
  signedIn: true;
  user: {
    name: string;
    image: string | null;
  };
  profile: {
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

type Account = SignedOutAccount | SignedInAccount;

const signInButtonClassName =
  "focus-ring inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-50 sm:gap-2 sm:px-3.5";

export function HeaderAccountSlot() {
  const [account, setAccount] = useState<Account | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccount() {
      try {
        const response = await fetch("/api/v1/account", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as Account;
        if (!controller.signal.aborted) {
          setAccount(payload);
        }
      } catch {
        // Keep the public header usable when the session endpoint is unavailable.
      }
    }

    void loadAccount();
    return () => controller.abort();
  }, []);

  if (!account) {
    return <div className="h-10 w-36 rounded-md border border-border bg-slate-50 sm:w-44" aria-hidden />;
  }

  if (!account.signedIn) {
    return (
      <GithubSignInButton className={signInButtonClassName}>
        <span className="sm:hidden">Sign in</span>
        <span className="hidden sm:inline">Sign in with GitHub</span>
      </GithubSignInButton>
    );
  }

  const displayName = account.profile.name || account.user.name || account.profile.handle;
  const avatarUrl = account.profile.avatarUrl || account.user.image;

  async function signOut() {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      setAccount({ signedIn: false });
      window.location.assign("/skills");
    }
  }

  return (
    <details className="group relative">
      <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded-md border border-border bg-white px-2 py-1.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <AccountAvatar imageUrl={avatarUrl} label={displayName} />
        <span className="hidden max-w-32 truncate sm:inline">{account.profile.handle}</span>
        <ChevronDown className="size-4 text-slate-500 transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
        <div className="border-b border-border px-4 py-3">
          <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
          <p className="mt-0.5 truncate text-xs text-muted">@{account.profile.handle}</p>
        </div>
        <nav className="p-1.5 text-sm" aria-label="Account">
          <AccountLink href="/dashboard" icon={<BookOpen className="size-4" aria-hidden />}>
            Dashboard
          </AccountLink>
          <AccountLink href="/dashboard/library" icon={<Library className="size-4" aria-hidden />}>
            Library
          </AccountLink>
          <AccountLink href="/dashboard/profile" icon={<UserRound className="size-4" aria-hidden />}>
            Edit profile
          </AccountLink>
          <AccountLink href={`/u/${account.profile.handle}`} icon={<UserRound className="size-4" aria-hidden />}>
            Public profile
          </AccountLink>
        </nav>
        <div className="border-t border-border p-1.5">
          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            className="focus-ring flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="size-4" aria-hidden />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </details>
  );
}

function AccountLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="focus-ring flex items-center gap-2 rounded-md px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
    >
      {icon}
      {children}
    </Link>
  );
}

function AccountAvatar({
  imageUrl,
  label,
}: {
  imageUrl: string | null;
  label: string;
}) {
  return (
    <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-950 text-xs font-semibold text-white">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="size-full object-cover" />
      ) : (
        initials(label)
      )}
    </span>
  );
}

function initials(value: string) {
  const parts = value.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "PS";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
