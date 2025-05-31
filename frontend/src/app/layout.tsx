// Instructions: Add performance and accessibility improvements to the layout

import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/contexts/WalletProvider";
import { GamificationProvider } from "@/components/gamification/AchievementSystem";
import { ABTestProvider } from "@/components/abtest/ABTestProvider";

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
    "nuclear",
    "unkillable",
    "gamification",
    "dao",
    "nft"
  ],
  openGraph: {
    title: "$BOOMROACH - The Unkillable Meme Coin",
    description:
      "Nuclear-powered meme coin with AI trading bot. The roach that survives everything and multiplies profits.",
    type: "website",
    url: "https://boomroach.wales",
    images: [
      {
        url: "https://ext.same-assets.com/3224214395/4224792650.png",
        width: 1200,
        height: 630,
        alt: "BoomRoach - The Unkillable Meme Coin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "$BOOMROACH - The Unkillable Meme Coin",
    description: "Nuclear-powered meme coin with AI trading bot",
    images: ["https://ext.same-assets.com/3224214395/4224792650.png"],
  },
  // Enhanced metadata for better SEO and performance
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://boomroach.wales',
  },
  // Performance and accessibility enhancements
  other: {
    'theme-color': '#ff9500',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#ff9500',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ext.same-assets.com" />

        {/* Favicon and app icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="https://ext.same-assets.com/3224214395/4224792650.png"
          as="image"
          type="image/png"
        />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//api.jupiter.ag" />
        <link rel="dns-prefetch" href="//api.dexscreener.com" />

        {/* Viewport optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

        {/* Accessibility enhancements */}
        <meta name="color-scheme" content="dark" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-neon-orange text-background px-4 py-2 rounded-br-lg font-semibold"
        >
          Skip to main content
        </a>

        {/* Focus trap for keyboard navigation */}
        <div id="focus-trap-start" tabIndex={0} className="sr-only" />

        <WalletProvider>
          <GamificationProvider>
            <ABTestProvider>
              <main id="main-content">
                {children}
              </main>
            </ABTestProvider>
          </GamificationProvider>
        </WalletProvider>

        <div id="focus-trap-end" tabIndex={0} className="sr-only" />

        {/* Loading indicator for better UX */}
        <noscript>
          <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <div className="text-center">
              <h1 className="text-2xl font-pixel text-neon-orange mb-4">$BOOMROACH</h1>
              <p className="text-muted-foreground">Please enable JavaScript to experience the full site.</p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}
