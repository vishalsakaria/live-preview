// Runs in the browser so Contentful can push live edits while someone is
// previewing. Inspector mode uses data attributes on each rendered field.
"use client";

import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";

import type { PageEntry } from "@/lib/contentful";

/**
 * Renders a single `page` entry, with Contentful's two live-preview features
 * wired up field-by-field. `page.tsx` fetches the entry on the server and
 * passes it in as `page`; this component then takes over in the browser.
 *
 * The two hooks below only do anything when draft mode is on — see
 * `LivePreviewProvider`, which only turns them on in that case. For a
 * regular (published) visit, this component just renders `page.fields`
 * as-is with no extra behavior.
 */
export function PageView({ page }: { page: PageEntry }) {
  // Live updates: while this page is open inside Contentful's preview pane,
  // the SDK listens for postMessage events sent by the entry editor and
  // patches `data` in place as the editor types — no save, no refresh. The
  // initial value is just `page`, the entry as fetched from the server.
  const data = useContentfulLiveUpdates(page);

  // Inspector mode: generates the `data-contentful-*` attributes that this
  // component spreads onto each field below. Contentful's preview pane reads
  // those attributes to draw the "edit" outline you see when hovering a
  // field, and to jump straight to that field in the entry editor on click.
  const inspectorProps = useContentfulInspectorMode({ entryId: data.sys.id });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-8 py-24">
      {/* fieldId must match the Contentful field's API ID exactly — this is
          how inspector mode knows which field in the entry editor to open. */}
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
