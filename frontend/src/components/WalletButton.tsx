"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePriceFeeds } from "@/hooks/usePriceFeeds";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  DollarSign,
  ExternalLink,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import React, { useEffect } from "react";
import { useGamification } from "@/components/gamification/AchievementSystem";

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { priceData } = usePriceFeeds();
  const { updateStats } = useGamification();

  // Update gamification stats when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      updateStats('walletsConnected', 1);
      updateStats('xp', 100); // Bonus XP for connecting wallet
    }
  }, [connected, publicKey, updateStats]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const openSolscan = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, "_blank");
  };

  if (!connected) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <WalletMultiButton className="!bg-nuclear-gradient !border-neon-orange/50 hover:!bg-neon-orange/20 !text-background !font-semibold !px-6 !py-3 !rounded-lg !transition-all !duration-300" />
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <Card className="glassmorphism border-neon-orange/30 bg-background/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-neon-green">
                  Connected
                </span>
              </div>

              <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">
                <Wallet className="w-3 h-3 mr-1" />
                Solana
              </Badge>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm">
                  {publicKey ? formatAddress(publicKey.toString()) : ""}
                </span>

                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 hover:bg-neon-orange/20"
                    onClick={() =>
                      publicKey && copyToClipboard(publicKey.toString())
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 hover:bg-neon-blue/20"
                    onClick={() =>
                      publicKey && openSolscan(publicKey.toString())
                    }
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center p-2 rounded-lg bg-neon-orange/10 border border-neon-orange/20">
                <div className="text-xs text-muted-foreground">$BOOMROACH</div>
                <div className="font-semibold text-sm">12,483</div>
                <div className="text-xs text-neon-green">
                  <TrendingUp className="w-3 h-3 inline mr-1" />+
                  {priceData.priceChange24h.toFixed(1)}%
                </div>
              </div>

              <div className="text-center p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
                <div className="text-xs text-muted-foreground">Portfolio</div>
                <div className="font-semibold text-sm">
                  ${(priceData.price * 12483).toFixed(2)}
                </div>
                <div className="text-xs text-neon-green">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Live
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                className="bg-nuclear-gradient hover:bg-neon-orange/20 text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Trade
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-neon-orange text-neon-orange hover:bg-neon-orange/10 text-xs"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Compact version for navigation
export function CompactWalletButton() {
  const { connected, publicKey } = useWallet();
  const { priceData } = usePriceFeeds();

  if (!connected) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <WalletMultiButton className="!bg-nuclear-gradient !border-neon-orange/50 hover:!bg-neon-orange/20 !text-background !font-semibold !px-4 !py-2 !rounded-lg !text-sm" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-3"
    >
      <div className="hidden sm:flex items-center space-x-2 font-mono text-sm">
        <span className="text-neon-green">${priceData.price.toFixed(6)}</span>
        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
        <span className="text-neon-blue">
          {publicKey
            ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
            : ""}
        </span>
      </div>

      <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
    </motion.div>
  );
}

// Wallet status indicator
export function WalletStatus() {
  const { connected, connecting, publicKey } = useWallet();

  return (
    <AnimatePresence mode="wait">
      {connecting && (
        <motion.div
          key="connecting"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-2 text-sm text-neon-orange"
        >
          <div className="w-2 h-2 bg-neon-orange rounded-full animate-pulse" />
          <span>Connecting...</span>
        </motion.div>
      )}

      {connected && publicKey && (
        <motion.div
          key="connected"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-2 text-sm text-neon-green"
        >
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          <span>Connected to {publicKey.toString().slice(0, 8)}...</span>
        </motion.div>
      )}

      {!connected && !connecting && (
        <motion.div
          key="disconnected"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-2 text-sm text-muted-foreground"
        >
          <div className="w-2 h-2 bg-muted-foreground rounded-full" />
          <span>Not connected</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
