import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BookNook | A little more room to read",
    template: "BookNook | %s",
  },
  description:
    "Discover, borrow, and share good books with the BookNook community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
