"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function PendingSubmitButton({
  children,
  pendingChildren,
  className,
  disabled,
  ariaLabel,
  "aria-label": ariaLabelAttribute,
  title,
}: {
  children: ReactNode;
  pendingChildren?: ReactNode;
  className: string;
  disabled?: boolean;
  ariaLabel?: string;
  "aria-label"?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;
  const accessibleLabel = ariaLabel ?? ariaLabelAttribute;
  const label = pending && typeof pendingChildren === "string"
    ? pendingChildren
    : accessibleLabel;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-label={label}
      title={pending && typeof pendingChildren === "string" ? pendingChildren : title}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? (pendingChildren ?? children) : children}
    </button>
  );
}
