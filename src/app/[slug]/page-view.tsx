// Runs in the browser so Contentful can push live edits while someone is
// previewing. Inspector mode uses data attributes on each rendered field.
"use client";

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";

import type { PageEntry } from "@/lib/contentful";

export function PageView({ page }: { page: PageEntry }) {
  const data = useContentfulLiveUpdates(page);
  const inspectorProps = useContentfulInspectorMode({ entryId: data.sys.id });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-8 py-24">
      <h1
        {...inspectorProps({ fieldId: "title" })}
        className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50"
      >
        {data.fields.title}
      </h1>
      <p
        {...inspectorProps({ fieldId: "subTitle" })}
        className="text-lg leading-8 text-zinc-600 dark:text-zinc-400"
      >
        {data.fields.subTitle}
      </p>
    </main>
  );
}
