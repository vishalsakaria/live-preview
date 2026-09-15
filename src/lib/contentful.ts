/**
 * Thin wrapper around Contentful's REST Content Preview API (CPA).
 *
 * Every request in this file goes through the *Preview* API
 * (`preview.contentful.com`), not the Delivery API (`cdn.contentful.com`).
 * That means the data returned here always includes unpublished changes —
 * this demo app is preview-only by design, so there is no separate
 * "published" code path to keep in sync.
 */

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

const PREVIEW_HOST = "https://preview.contentful.com";

/** The Contentful content type ("model") this app knows how to render. */
export const CONTENT_TYPE = "page";

/**
 * Cleans up a slug so it can be safely dropped into a `/${slug}` link or used
 * to look up an entry.
 *
 * Editors sometimes paste a slug with a leading/trailing slash (`/about/`)
 * or even a full URL (`https://example.com/about`) into the slug field.
 * Without this, `href={`/${slug}`}` could produce `//about`, which browsers
 * resolve as a *protocol-relative* URL (`https://about`) instead of a path
 * on this site — a broken link that's easy to miss in testing.
 *
 * @param slug - The raw slug value from Contentful, or from a URL segment.
 * @returns The slug with any leading/trailing slashes and host removed.
 */
export function normalizeSlug(slug: string): string {
  const trimmed = slug.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname.replace(/^\/+|\/+$/g, "");
    } catch {
      // Not actually a valid URL despite the http(s) prefix — fall through
      // and treat it as a plain slug instead.
    }
  }

  return trimmed.replace(/^\/+|\/+$/g, "");
}

/**
 * Shape of the `page` content type as returned by the Content Preview API.
 *
 * This mirrors Contentful's REST response shape (`sys` + `fields`) rather
 * than a flattened, app-friendly object, because entries are passed
 * untouched into `useContentfulLiveUpdates` (see `page-view.tsx`) — that
 * hook needs the original Contentful shape to match up live edits with the
 * right entry and field.
 */
export type PageEntry = {
  sys: { id: string };
  fields: {
    /** Headline shown on the page. */
    title?: string;
    /** Editor-facing name shown in the home page list; never rendered on the page itself. */
    internalName?: string;
    /** Supporting text shown under the title. */
    subTitle?: string;
    /** URL path this entry should be reachable at, e.g. "about" for `/about`. */
    slug?: string;
  };
};

/** Shape Contentful wraps a list of entries in, e.g. from a "get all pages" query. */
type EntryCollection<T> = {
  total: number;
  items: T[];
};

/**
 * Fetches entries from the Content Preview API's `/entries` endpoint.
 *
 * This is the one place an HTTP call to Contentful is made — `getPageBySlug`
 * and `getAllPages` below both build their query params and call this.
 *
 * @param params - Contentful query params, e.g. `{ content_type: "page" }`
 *   or `{ "fields.slug": "about" }`. See Contentful's Search Parameters docs.
 * @returns The parsed JSON response, typed as `T` (usually an `EntryCollection`).
 * @throws If `CONTENTFUL_SPACE_ID`/`CONTENTFUL_PREVIEW_TOKEN` are missing, or
 *   Contentful responds with a non-2xx status (bad token, bad space id, etc.).
 */
async function request<T>(params: Record<string, string>): Promise<T> {
  if (!SPACE_ID) {
    throw new Error("CONTENTFUL_SPACE_ID is not set");
  }

  const token = process.env.CONTENTFUL_PREVIEW_TOKEN;

  if (!token) {
    throw new Error("CONTENTFUL_PREVIEW_TOKEN is not set");
  }

  const url = new URL(
    `/spaces/${SPACE_ID}/environments/${ENVIRONMENT}/entries`,
    PREVIEW_HOST,
  );
  // Contentful's search API takes filters as query string params, e.g.
  // ?content_type=page&fields.slug=about — build that up from whatever the
  // caller asked for.
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    // Draft/preview content changes on every edit, so this endpoint is never
    // cached — each request goes straight to Contentful.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Contentful request failed (${res.status}): ${await res.text()}`,
    );
  }

  return (await res.json()) as T;
}

/**
 * Looks up a single `page` entry by its slug.
 *
 * Used by `/[slug]/page.tsx` to render a page, and by `/api/draft/route.ts`
 * to confirm a preview link points at a real entry before turning on draft
 * mode.
 *
 * @param slug - The slug to look up, typically taken straight from the URL
 *   (e.g. the `slug` route param, or the `?slug=` query string on the draft
 *   API route). Does not need to be pre-normalized — this function handles
 *   both slugs stored with and without a leading slash in Contentful.
 * @returns The matching entry, or `null` if no `page` has that slug.
 */
export async function getPageBySlug(slug: string): Promise<PageEntry | null> {
  const normalized = normalizeSlug(slug);

  // Contentful entries may store slugs with or without a leading slash.
  for (const candidate of [normalized, `/${normalized}`]) {
    const { items } = await request<EntryCollection<PageEntry>>({
      content_type: CONTENT_TYPE,
      "fields.slug": candidate,
      limit: "1",
    });

    if (items[0]) {
      return items[0];
    }
  }

  return null;
}

/**
 * Fetches every `page` entry, oldest first.
 *
 * Used by the home page (`src/app/page.tsx`) to list all available pages as
 * links.
 *
 * @returns All `page` entries in the space/environment, ordered by creation date.
 */
export async function getAllPages(): Promise<PageEntry[]> {
  const { items } = await request<EntryCollection<PageEntry>>({
    content_type: CONTENT_TYPE,
    order: "sys.createdAt",
  });

  return items;
}
