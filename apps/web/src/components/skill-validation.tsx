import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "./badge";
import type { CatalogValidationIssue } from "../lib/server/catalog";

export function SkillValidationBadges({
  issues,
}: {
  issues: CatalogValidationIssue[];
}) {
  const counts = validationCounts(issues);
  if (counts.errors > 0) {
    return <Badge variant="red">{countLabel(counts.errors, "validation error")}</Badge>;
  }
  if (counts.warnings > 0) {
    return <Badge variant="amber">{countLabel(counts.warnings, "warning")}</Badge>;
  }
  return <Badge variant="green">Validated</Badge>;
}

export function validationSummary(issues: CatalogValidationIssue[]) {
  const counts = validationCounts(issues);
  if (counts.errors > 0) return countLabel(counts.errors, "validation error");
  if (counts.warnings > 0) return countLabel(counts.warnings, "warning");
  return "No validation warnings";
}

export function SkillValidationPanel({
  issues,
  note,
}: {
  issues: CatalogValidationIssue[];
  note: string;
}) {
  const counts = validationCounts(issues);
  const hasErrors = counts.errors > 0;
  const hasWarnings = counts.warnings > 0;
  const hasIssues = hasErrors || hasWarnings;
  const Icon = hasErrors || hasWarnings ? AlertTriangle : ShieldCheck;
  const className = hasErrors
    ? "border-red-200 bg-red-50 text-red-900"
    : hasWarnings
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <div className={`mt-4 rounded-lg border p-5 text-sm ${className}`}>
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="size-4" aria-hidden />
        {hasIssues ? "Validation issues" : "Validated package"}
      </div>
      <p className="mt-2 leading-6">{note}</p>
      {hasIssues ? (
        <ul className="mt-3 space-y-2">
          {issues.map((issue) => (
            <li key={`${issue.level}-${issue.code}-${issue.path ?? ""}`} className="leading-5">
              <span className="font-semibold">{issue.message}</span>
              {issue.path ? (
                <span className="text-current/70"> {issue.path}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 inline-flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-4" aria-hidden />
          No validation warnings were found.
        </div>
      )}
    </div>
  );
}

function validationCounts(issues: CatalogValidationIssue[]) {
  return {
    errors: issues.filter((issue) => issue.level === "error").length,
    warnings: issues.filter((issue) => issue.level === "warning").length,
  };
}

function countLabel(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}
