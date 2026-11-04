import type { Metadata } from "next";
import { Suspense } from "react";
import BookDetails from "@/components/BookDetails";

export const metadata: Metadata = {
  title: "Book Details",
};

async function BookDetailsPageContent({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookDetails id={id} />;
}

export default function BookDetailsPage({
  params,
}: PageProps<"/books/[id]">) {
  return (
    <Suspense fallback={<div className="loading-state"><span className="spinner" /></div>}>
      <BookDetailsPageContent params={params} />
    </Suspense>
  );
}
