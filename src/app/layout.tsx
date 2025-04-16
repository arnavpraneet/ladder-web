import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ladder - Legislative Assistant for Democratic Dialogue, Empowerment, and Reform",
  description: "A web application that allows the general public to view, browse, and interact with government bills by providing summaries and answering questions about them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-y-auto">{children}</body>
    </html>
  );
}
