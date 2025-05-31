"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  Coin98WalletAdapter,
  MathWalletAdapter,
  // BackpackWalletAdapter, // Not available in current version
  // GlowWalletAdapter, // Not available in current version
  // SlopeWalletAdapter, // Not available in current version
  TokenPocketWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  SafePalWalletAdapter,
  // ExodusWalletAdapter, // Not available in current version
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import type React from "react";
import { useMemo } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet;

  // Enhanced RPC endpoints with fallbacks
  const endpoint = useMemo(() => {
    // Primary RPC endpoints for better reliability
    const endpoints = [
      process.env.NEXT_PUBLIC_RPC_ENDPOINT,
      "https://api.mainnet-beta.solana.com",
      "https://solana-api.projectserum.com",
      clusterApiUrl(network),
    ].filter(Boolean);

    return endpoints[0] || clusterApiUrl(network);
  }, [network]);

  // Comprehensive wallet list with all major Solana wallets
  const wallets = useMemo(
    () => [
      // Tier 1: Most popular and reliable wallets
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      // new BackpackWalletAdapter(), // Not available in current version
      // new GlowWalletAdapter(), // Not available in current version

      // Tier 2: Well-established wallets
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      // new SlopeWalletAdapter(), // Not available in current version
      // new ExodusWalletAdapter(), // Not available in current version
      new TrustWalletAdapter(),

      // Tier 3: Additional popular wallets
      new Coin98WalletAdapter(),
      new MathWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new SafePalWalletAdapter(),

      // Tier 4: Other supported wallets
      new BitpieWalletAdapter(),
      new CloverWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        commitment: 'confirmed',
        wsEndpoint: endpoint.replace('https://', 'wss://').replace('http://', 'ws://'),
      }}
    >
      <SolanaWalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={(error) => {
          console.error('Wallet error:', error);
          // Could add toast notification here
        }}
      >
        <WalletModalProvider
          featuredWallets={4}
          className="wallet-modal-custom"
        >
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
