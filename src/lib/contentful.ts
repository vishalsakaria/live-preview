const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

const PREVIEW_HOST = "https://preview.contentful.com";

export const CONTENT_TYPE = "page";

/** Shape of the `page` content type as returned by the Content Preview API. */
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
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Contentful request failed (${res.status}): ${await res.text()}`,
    );
  }

  return (await res.json()) as T;
}

export async function getPageBySlug(slug: string): Promise<PageEntry | null> {
  const { items } = await request<EntryCollection<PageEntry>>({
    content_type: CONTENT_TYPE,
    "fields.slug": slug,
    limit: "1",
  });

  return items[0] ?? null;
}

export async function getAllPages(): Promise<PageEntry[]> {
  const { items } = await request<EntryCollection<PageEntry>>({
    content_type: CONTENT_TYPE,
    order: "sys.createdAt",
  });

  return items;
}
