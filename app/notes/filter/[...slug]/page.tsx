import { notFound } from "next/navigation";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/notes";
import { NOTE_TAGS } from "@/lib/constants";
import type { NoteTag } from "@/types/note";
import NotesClient from "../../Notes.client";

export const dynamic = "force-dynamic";

interface FilterNotesPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function FilterNotesPage({ params }: FilterNotesPageProps) {
  const { slug } = await params;

  if (slug.length !== 1) notFound();

  const [rawTag] = slug;
  const tag = decodeURIComponent(rawTag);

  if (tag !== "all" && !NOTE_TAGS.includes(tag as NoteTag)) notFound();

  // for "All notes" the tag is not passed to the API at all
  const apiTag = tag === "all" ? undefined : tag;

  const queryClient = new QueryClient();
  await queryClient.fetchQuery({
    queryKey: ["notes", 1, "", tag],
    queryFn: () => fetchNotes({ page: 1, perPage: 12, search: "", tag: apiTag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={tag} tag={tag} />
    </HydrationBoundary>
  );
}
