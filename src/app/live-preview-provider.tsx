// This file runs in the browser, not on the server. Contentful's live preview
// needs to listen for edits and update the page in real time, which only works
// in the user's browser while they are previewing inside Contentful.
"use client";

import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";
import type { ReactNode } from "react";

/**
 * Wraps the site in Contentful's live preview layer. When draft mode is on,
 * editors see live updates as they type and can click content to jump to the
 * matching field in Contentful (via Content Source Maps on encoded fields).
 * For everyone else, preview features stay off.
 */
export function LivePreviewProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  return (
    <ContentfulLivePreviewProvider
      locale={process.env.NEXT_PUBLIC_CONTENTFUL_LOCALE ?? "en-US"}
      // Inspector mode: click a heading or paragraph to open that field in the editor.
      enableInspectorMode={enabled}
      // Live updates: changes in Contentful appear on the page without a refresh.
      enableLiveUpdates={enabled}
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}
