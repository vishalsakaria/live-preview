import Link from "next/link";

import { getAllPages, normalizeSlug } from "@/lib/contentful";

/**
 * Home page: lists every `page` entry from Contentful as a link. This is a
 * Server Component (no `"use client"`), so `getAllPages()` runs on the
 * server on every request — there's no client-side data fetching here.
 *
 * Note this list always reflects Draft Mode too: `getAllPages()` always
 * queries the Preview API (see `src/lib/contentful.ts`), so a page you've
 * created but not yet published still shows up here.
 */
export default async function Home() {
  const pages = await getAllPages();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-8 py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Pages
      </h1>

      {pages.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No <code>page</code> entries found in Contentful.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pages.map((page) => (
            <li key={page.sys.id}>
              {page.fields.slug ? (
                <Link
                  href={`/${normalizeSlug(page.fields.slug)}`}
                  className="font-medium text-zinc-950 underline dark:text-zinc-50"
                >
                  {page.fields.internalName ?? page.fields.title}
                </Link>
              ) : (
                <span className="text-zinc-600 dark:text-zinc-400">
                  {page.fields.internalName ?? page.fields.title} (no slug)
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
