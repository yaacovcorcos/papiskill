"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileActionState } from "../actions";

interface ProfileFormProps {
  profile: {
    handle: string;
    name: string | null;
    bio: string | null;
    website: string | null;
    githubUrl: string | null;
  };
}

const initialState: ProfileActionState = {};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Identity</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Your handle is used in public skill URLs and CLI install references.</p>
        <div className="mt-5 space-y-4">
          <Field label="Handle" name="handle" defaultValue={profile.handle} required />
          <Field label="Display name" name="name" defaultValue={profile.name ?? ""} />
          <Field label="Website" name="website" defaultValue={profile.website ?? ""} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Profile details</h2>
        <label className="mt-5 block text-sm font-medium">
          Bio
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={7}
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm leading-6 outline-none focus:border-accent"
          />
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button disabled={pending} type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Saving..." : "Save profile"}
          </button>
          {state.ok ? <span className="text-sm font-medium text-emerald-700">Saved.</span> : null}
          {state.error ? <span className="text-sm font-medium text-red-700">{state.error}</span> : null}
        </div>

        <div className="mt-8 rounded-md border border-border bg-surface-subtle p-4">
          <h3 className="text-sm font-semibold">Current references</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Profile</dt>
              <dd className="font-mono">/u/{profile.handle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Skill reference</dt>
              <dd className="font-mono">{profile.handle}/skill-slug</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">GitHub</dt>
              <dd className="truncate font-medium">{profile.githubUrl || "Not connected"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}
