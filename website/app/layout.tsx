import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprout — Your tiny browser friend",
  description: "A little woodland companion for your browser. Meet Sprout, try an interactive preview, and download the free Chrome tester.",
  icons: {
    icon: "/pet/sprout-0.png",
    shortcut: "/pet/sprout-0.png",
  },
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
