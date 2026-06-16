"use client";

import { useState } from "react";
import { Github } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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
  const [isPending, setIsPending] = useState(false);

  async function signIn() {
    setIsPending(true);
    const result = await authClient.signIn.social({
      provider: "github",
      callbackURL,
    });
    if (result.error) {
      setIsPending(false);
    }
  }

  return (
    <button type="button" className={className} onClick={signIn} disabled={isPending}>
      {showIcon ? <Github className="size-4" aria-hidden /> : null}
      {isPending ? "Opening GitHub..." : children}
    </button>
  );
}
