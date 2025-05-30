// Instructions: Add wallet provider to the main layout

import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/contexts/WalletProvider";

export const metadata: Metadata = {
  title: "$BOOMROACH - The Unkillable Meme Coin | 2025 Edition",
  description:
    "The ultimate Solana meme coin powered by AI trading bots, nuclear energy, and an unstoppable community. Join the roach army and multiply your profits.",
  keywords: [
    "solana",
    "meme coin",
    "crypto",
    "defi",
    "trading bot",
    "ai",
    "boomroach",
  ],
  openGraph: {
    title: "$BOOMROACH - The Unkillable Meme Coin",
    description:
      "Nuclear-powered meme coin with AI trading bot. The roach that survives everything and multiplies profits.",
    type: "website",
    url: "https://boomroach.wales",
  },
  twitter: {
    card: "summary_large_image",
    title: "$BOOMROACH - The Unkillable Meme Coin",
    description: "Nuclear-powered meme coin with AI trading bot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
