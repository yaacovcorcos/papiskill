"use client";

import { Github } from "lucide-react";

interface GithubSignInButtonProps {
  callbackURL?: string;
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function GithubSignInButton({
  callbackURL = "/dashboard",
  className,
  children = "Sign in with GitHub",
  showIcon = true,
}: GithubSignInButtonProps) {
  const href = `/auth/github?callbackURL=${encodeURIComponent(callbackURL)}`;

  return (
    <a className={className} href={href}>
      {showIcon ? <Github className="size-4" aria-hidden /> : null}
      {children}
    </a>
  );
}
