import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

async function exitDraftMode() {
  "use server";

  const draft = await draftMode();
  draft.disable();
  redirect("/");
}

/**
 * Which deployment is being viewed. Vercel exposes the deployed branch and the
 * target environment as system environment variables, so the banner can tell a
 * preview of a feature branch apart from production inside Contentful's preview
 * pane. Neither is set by `next dev`, hence the local fallback.
 */
function deployment() {
  return {
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? "local",
    environment: process.env.VERCEL_TARGET_ENV ?? process.env.VERCEL_ENV ?? null,
  };
}

export async function DraftModeBanner() {
  const { isEnabled } = await draftMode();

  if (!isEnabled) {
    return null;
  }

  const { branch, environment } = deployment();

  return (
    <aside
      role="status"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>Draft mode is on — showing unpublished Contentful content.</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-amber-950/70">Branch</span>
          <code className="rounded-full bg-amber-950/10 px-2 py-0.5 font-mono text-xs">
            {branch}
          </code>
          {environment ? (
            <span className="text-amber-950/70">({environment})</span>
          ) : null}
        </span>
      </div>
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
