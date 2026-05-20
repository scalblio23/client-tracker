import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Tracker — Harbourview",
  description: "Track clients, leads, and contact dates",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
