import type { Metadata } from "next";
import AddBookContent from "@/components/AddBookContent";

export const metadata: Metadata = {
  title: "Add a Book",
};

export default function AddBookPage() {
  return <AddBookContent />;
}
