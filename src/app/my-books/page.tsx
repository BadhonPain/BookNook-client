import type { Metadata } from "next";
import MyBooksContent from "@/components/MyBooksContent";

export const metadata: Metadata = {
  title: "My Books",
};

export default function MyBooksPage() {
  return <MyBooksContent />;
}
