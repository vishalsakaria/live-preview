import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { getPageBySlug, normalizeSlug } from "@/lib/contentful";

/**
 * Entry point for Contentful's "Open live preview" / "Preview" button.
 *
 * This is what Contentful actually opens when an editor clicks preview on an
 * entry — a URL shaped like `/api/draft?secret=...&slug=...`, configured in
 * the space's Content Preview settings. It has three jobs:
 *
 *   1. Verify the request is genuinely from Contentful (via a shared secret).
 *   2. Turn on Next.js Draft Mode, which is what makes every subsequent page
 *      render preview content instead of only published content, and shows
 *      the `DraftModeBanner`.
 *   3. Redirect the browser to the actual page for the entry being previewed.
 *
 * See Next.js's Draft Mode docs for how `draftMode()` works under the hood:
 * https://nextjs.org/docs/app/building-your-application/configuring/draft-mode
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // The preview secret must be configured on the server. Without it, we cannot
  // verify that preview requests are coming from Contentful.
  if (!process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("CONTENTFUL_PREVIEW_SECRET is not set", { status: 500 });
  }

  // Only allow preview when the URL includes the correct secret and a page slug.
  // This stops anyone from enabling draft mode by guessing a preview link.
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET || !slug) {
    return new Response("Invalid token", { status: 401 });
  }

  const page = await getPageBySlug(slug);

  // Confirm the slug matches a real page in Contentful before turning on preview.
  if (!page?.fields.slug) {
    return new Response("Invalid slug", { status: 401 });
  }

  // Draft mode stores a small cookie in the browser so that as you move between
  // pages or refresh, the site continues to show preview content instead of the
  // live published version. Preview stays on until you close the browser or
  // click Exit draft mode.
  const draft = await draftMode();
  draft.enable();

  // Contentful shows your site inside a preview pane on app.contentful.com (an
  // iframe), not in its own browser tab. Browsers are cautious about cookies in
  // that situation and may refuse to send the preview cookie on later page
  // loads. Setting SameSite=None (with Secure, over HTTPS) tells the browser it
  // is safe to keep sending the cookie while you navigate inside the preview.
  const cookieStore = await cookies();
  const bypassCookie = cookieStore.get("__prerender_bypass");
  if (bypassCookie) {
    cookieStore.set({
      name: bypassCookie.name,
      value: bypassCookie.value,
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
    });
  }

  // Send the editor to the page they previewed. We use the slug stored in
  // Contentful, not the slug from the URL, so a malicious link cannot trick
  // this route into redirecting people to an unexpected or harmful destination.
  redirect(`/${normalizeSlug(page.fields.slug)}`);
}
