import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

async function exitDraftMode() {
  "use server";

  const draft = await draftMode();
  draft.disable();
  redirect("/");
}

export async function DraftModeBanner() {
  const { isEnabled } = await draftMode();

  if (!isEnabled) {
    return null;
  }

  return (
    <aside
      role="status"
      className="flex items-center justify-between gap-4 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <span>Draft mode is on — showing unpublished Contentful content.</span>
      <form action={exitDraftMode}>
        <button
          type="submit"
          className="rounded-full border border-amber-950/20 px-3 py-1 transition-colors hover:bg-amber-950/10"
        >
          Exit draft mode
        </button>
      </form>
    </aside>
  );
}
