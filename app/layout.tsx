// app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PATHLESS // CONFORMITY IS DEAD",
  description: "Streetwear brand focused on personal paths and brutalist architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-white text-black uppercase antialiased selection:bg-black selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}