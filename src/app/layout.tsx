import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ladder - Browse and Chat about Government Bills",
  description: "A web application that allows the general public to view, browse, and interact with government bills by providing summaries and answering questions about them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
