// Runs in the browser so Contentful can push live edits while someone is
// previewing. Inspector mode is handled via Content Source Maps (invisible
// metadata embedded in field values on the server) rather than manual tags.
"use client";

import { useContentfulLiveUpdates } from "@contentful/live-preview/react";

import type { PageEntry } from "@/lib/contentful";

export function PageView({ page }: { page: PageEntry }) {
  // Keeps encoded field values in sync with Contentful as the editor types.
  const data = useContentfulLiveUpdates(page);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-8 py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {data.fields.title}
      </h1>
      <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {data.fields.subTitle}
      </p>
    </main>
  );
}
