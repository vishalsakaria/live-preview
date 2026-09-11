import { notFound } from "next/navigation";

import { getPageBySlug } from "@/lib/contentful";

import { PageView } from "./page-view";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <PageView page={page} />;
}
