"use client";

import { Columns2, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { SkillMarkdown } from "./skill-markdown";

type MarkdownMode = "write" | "preview" | "split";

interface SkillMarkdownEditorProps {
  name: string;
  defaultValue: string;
  rows?: number;
}

const modes: Array<{
  id: MarkdownMode;
  label: string;
  icon: typeof Pencil;
}> = [
  { id: "write", label: "Write", icon: Pencil },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "split", label: "Split", icon: Columns2 },
];

export function SkillMarkdownEditor({
  name,
  defaultValue,
  rows = 32,
}: SkillMarkdownEditorProps) {
  const [mode, setMode] = useState<MarkdownMode>("split");
  const [value, setValue] = useState(defaultValue);
  const showEditor = mode !== "preview";
  const showPreview = mode !== "write";

  return (
    <section className="rounded-lg border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold">SKILL.md</h2>
        <div className="inline-flex w-full rounded-md border border-border bg-slate-50 p-1 sm:w-auto">
          {modes.map((item) => {
            const Icon = item.icon;
            const selected = item.id === mode;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(item.id)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition sm:flex-none ${
                  selected
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={
          mode === "split"
            ? "grid min-h-[720px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            : "min-h-[720px]"
        }
      >
        <div
          className={
            showEditor
              ? "min-w-0 border-border lg:border-r"
              : "sr-only"
          }
        >
          <textarea
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={rows}
            spellCheck={false}
            className="block min-h-[720px] w-full resize-y border-0 bg-slate-50 px-4 py-4 font-mono text-sm leading-6 text-slate-900 outline-none focus:bg-white"
          />
        </div>

        {showPreview ? (
          <div className="min-w-0 overflow-auto bg-white px-5 py-5">
            {value.trim() ? (
              <SkillMarkdown markdown={value} className="skill-markdown--compact" />
            ) : (
              <div className="flex min-h-[660px] items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle px-6 text-center text-sm text-muted">
                Preview will appear after you write markdown.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
