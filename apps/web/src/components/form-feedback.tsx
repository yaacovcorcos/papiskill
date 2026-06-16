import type { ReactNode } from "react";

interface FormFeedbackProps {
  id?: string;
  kind: "error" | "success";
  children: ReactNode;
  className?: string;
}

export function FormFeedback({
  id,
  kind,
  children,
  className = "",
}: FormFeedbackProps) {
  const isError = kind === "error";
  const tone = isError ? "text-red-700" : "text-emerald-700";

  return (
    <p
      id={id}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`${className || "mt-2 text-sm font-medium"} ${tone}`}
    >
      {children}
    </p>
  );
}
