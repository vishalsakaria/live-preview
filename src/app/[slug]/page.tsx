import { notFound } from "next/navigation";

import { getPageBySlug } from "@/lib/contentful";

import { PageView } from "./page-view";

/**
 * Dynamic route that renders a single Contentful `page` entry at its slug,
 * e.g. this file renders both `/about` and `/contact`.
 *
 * This is a Server Component: it runs on the server (or at request time on
 * Vercel), fetches the matching entry from Contentful, and hands the raw
 * data to `PageView` — a Client Component — to actually render. The split
 * matters here specifically because Contentful's live preview SDK
 * (`useContentfulLiveUpdates`, `useContentfulInspectorMode` in
 * `page-view.tsx`) only works in the browser, so the interactive parts have
 * to live in a Client Component while the initial data fetch stays on the
 * server.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await getPageBySlug(slug);

  // No entry has this slug — render Next.js's built-in 404 page instead of a
  // blank/broken page.
  if (!page) {
    notFound();
  }

  return <PageView page={page} />;
}
