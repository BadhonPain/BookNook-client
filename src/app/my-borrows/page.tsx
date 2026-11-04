import type { Metadata } from "next";
import MyBorrowsContent from "@/components/MyBorrowsContent";

export const metadata: Metadata = {
  title: "My Borrows",
};

export default function MyBorrowsPage() {
  return <MyBorrowsContent />;
}
