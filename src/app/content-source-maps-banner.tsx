/**
 * Always visible, regardless of draft mode, so anyone looking at this
 * deployment can tell it demos inspector mode via Content Source Maps
 * (metadata encoded into field values) rather than main's manual
 * data-attribute approach. See src/lib/contentful.ts.
 */
export function ContentSourceMapsBanner() {
  return (
    <aside
      role="note"
      className="flex items-center justify-center gap-2 bg-zinc-900 px-4 py-1.5 text-center text-xs font-medium text-zinc-100 dark:bg-zinc-800"
    >
      <span aria-hidden>⚙</span>
      <span>
        This deployment demos{" "}
        <span className="font-semibold">Content Source Maps mode</span>
      </span>
    </aside>
  );
}
