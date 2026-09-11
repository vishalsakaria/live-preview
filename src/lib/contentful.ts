import { encodeCPAResponse } from "@contentful/content-source-maps";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

const PREVIEW_HOST = "https://preview.contentful.com";

export const CONTENT_TYPE = "page";

/** Strip slashes and URL prefixes so slugs work safely in `/${slug}` links. */
export function normalizeSlug(slug: string): string {
  const trimmed = slug.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname.replace(/^\/+|\/+$/g, "");
    } catch {
      // Fall through if the value isn't a valid URL.
    }
  }

  return trimmed.replace(/^\/+|\/+$/g, "");
}

/**
 * Shape of the `page` content type as returned by the Content Preview API.
 * Entries are passed to `useContentfulLiveUpdates` after Content Source Maps
 * encoding, so string fields carry invisible metadata for inspector mode.
 */
export type PageEntry = {
  sys: { id: string };
  fields: {
    title?: string;
    internalName?: string;
    subTitle?: string;
    slug?: string;
  };
};

type EntryCollection<T> = {
  total: number;
  items: T[];
};

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
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  // Ask Contentful to include Content Source Maps (Premium). The maps are
  // embedded into field values by encodeCPAResponse so inspector mode works
  // without manual data attributes on each element.
  url.searchParams.set("includeContentSourceMaps", "true");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Contentful request failed (${res.status}): ${await res.text()}`,
    );
  }

  const raw = await res.json();
  return encodeCPAResponse(raw) as T;
}

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

export async function getAllPages(): Promise<PageEntry[]> {
  const { items } = await request<EntryCollection<PageEntry>>({
    content_type: CONTENT_TYPE,
    order: "sys.createdAt",
  });

  return items;
}
