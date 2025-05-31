"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePriceFeeds } from "@/hooks/usePriceFeeds";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  DollarSign,
  ExternalLink,
  TrendingUp,
  Wallet,
  Zap,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  Coins,
  Shield,
  Globe
} from "lucide-react";
import React, { useEffect, useState } from "react";

export function WalletButton() {
  const { connected, publicKey, disconnect, connecting, wallet } = useWallet();
  const { priceData } = usePriceFeeds();
  const [copied, setCopied] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState(524.67); // Mock portfolio value
  const [holdings, setHoldings] = useState(12483); // Mock holdings

  // Simulate portfolio updates
  useEffect(() => {
    if (connected) {
      const interval = setInterval(() => {
        setPortfolioValue(prev => prev + (Math.random() - 0.5) * 10);
        setHoldings(prev => prev + Math.floor(Math.random() * 3));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [connected]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openSolscan = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, "_blank");
  };

  if (connecting) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glassmorphism border-neon-orange/30 px-4 py-2 rounded-lg"
      >
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-4 h-4 border-2 border-neon-orange border-t-transparent rounded-full"
          />
          <span className="text-sm text-neon-orange">Connecting...</span>
        </div>
      </motion.div>
    );
  }

  if (!connected) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <WalletMultiButton className="!bg-nuclear-gradient !border-neon-orange/50 hover:!bg-neon-orange/20 !text-background !font-semibold !px-6 !py-3 !rounded-lg !transition-all !duration-300 !shadow-lg hover:!shadow-xl" />

        {/* Floating glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: [
              "0 0 0px rgba(255, 149, 0, 0)",
              "0 0 20px rgba(255, 149, 0, 0.3)",
              "0 0 0px rgba(255, 149, 0, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
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
        <Card className="glassmorphism border-neon-orange/30 bg-background/80 shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-3 h-3 bg-neon-green rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <span className="text-sm font-semibold text-neon-green">
                  Connected
                </span>
                <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">
                  <Wallet className="w-3 h-3 mr-1" />
                  {wallet?.adapter.name || 'Solana'}
                </Badge>
              </div>

              {/* Connection status indicator */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="text-neon-green"
              >
                <Activity className="w-4 h-4" />
              </motion.div>
            </div>

            {/* Wallet Address */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-background/50 border border-neon-orange/20">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm text-foreground">
                  {publicKey ? formatAddress(publicKey.toString()) : ""}
                </span>

                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => publicKey && copyToClipboard(publicKey.toString())}
                    className="p-1 rounded hover:bg-neon-orange/20 transition-colors"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <CheckCircle className="w-3 h-3 text-neon-green" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy className="w-3 h-3 text-neon-orange" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => publicKey && openSolscan(publicKey.toString())}
                    className="p-1 rounded hover:bg-neon-blue/20 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-neon-blue" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Portfolio Overview */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div
                className="text-center p-3 rounded-lg bg-neon-orange/10 border border-neon-orange/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Coins className="w-3 h-3 text-neon-orange" />
                  <span className="text-xs text-muted-foreground">$BOOMROACH</span>
                </div>
                <motion.div
                  className="font-semibold text-sm text-neon-orange"
                  key={holdings}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {holdings.toLocaleString()}
                </motion.div>
                <div className="text-xs text-neon-green flex items-center justify-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{priceData.priceChange24h.toFixed(1)}%</span>
                </div>
              </motion.div>

              <motion.div
                className="text-center p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <BarChart3 className="w-3 h-3 text-neon-blue" />
                  <span className="text-xs text-muted-foreground">Portfolio</span>
                </div>
                <motion.div
                  className="font-semibold text-sm text-neon-blue"
                  key={portfolioValue}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ${portfolioValue.toFixed(2)}
                </motion.div>
                <div className="text-xs text-neon-green flex items-center justify-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Live</span>
                </div>
              </motion.div>
            </div>

            {/* Security Features */}
            <div className="mb-4 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-neon-green" />
                <span className="text-sm font-semibold text-neon-green">Security Features</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                  <span>Hardware Wallet</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-neon-green" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-neon-blue" />
                  <span>Mainnet</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-neon-orange" />
                  <span>Live Updates</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  className="w-full bg-nuclear-gradient hover:bg-neon-orange/20 text-xs font-semibold"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Trade
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <WalletDisconnectButton className="!w-full !bg-transparent !border !border-neon-orange !text-neon-orange hover:!bg-neon-orange/10 !text-xs !py-1.5 !px-3 !rounded !font-semibold !transition-all !duration-300" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating particles effect */}
      <motion.div
        className="absolute -inset-4 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(255,149,0,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(57,255,20,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, rgba(255,149,0,0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  );
}

// Compact version for navigation
export function CompactWalletButton() {
  const { connected, publicKey, connecting } = useWallet();
  const { priceData } = usePriceFeeds();

  if (connecting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg glassmorphism border border-neon-orange/30"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-3 h-3 border-2 border-neon-orange border-t-transparent rounded-full"
        />
        <span className="text-xs text-neon-orange">Connecting...</span>
      </motion.div>
    );
  }

  if (!connected) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <WalletMultiButton className="!bg-nuclear-gradient !border-neon-orange/50 hover:!bg-neon-orange/20 !text-background !font-semibold !px-4 !py-2 !rounded-lg !text-sm !transition-all !duration-300" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-3"
    >
      <div className="hidden sm:flex items-center space-x-3 px-3 py-2 rounded-lg glassmorphism border border-neon-green/30">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-neon-green"
        >
          <Activity className="w-3 h-3" />
        </motion.div>
        <div className="font-mono text-sm">
          <span className="text-neon-green">${priceData.price.toFixed(6)}</span>
          <span className="text-muted-foreground mx-1">|</span>
          <span className="text-neon-blue">
            {publicKey
              ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
              : ""}
          </span>
        </div>
      </div>

      <motion.div
        className="w-2 h-2 bg-neon-green rounded-full"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
    </motion.div>
  );
}

// Wallet status indicator
export function WalletStatus() {
  const { connected, connecting, publicKey, wallet } = useWallet();

  return (
    <AnimatePresence mode="wait">
      {connecting && (
        <motion.div
          key="connecting"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-3 text-sm text-neon-orange"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-4 h-4 border-2 border-neon-orange border-t-transparent rounded-full"
          />
          <span>Connecting to {wallet?.adapter.name || 'wallet'}...</span>
        </motion.div>
      )}

      {connected && publicKey && (
        <motion.div
          key="connected"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 text-sm text-neon-green">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-3 h-3 bg-neon-green rounded-full"
            />
            <span>Connected via {wallet?.adapter.name}</span>
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
              <Shield className="w-2 h-2 mr-1" />
              Secure
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {publicKey.toString().slice(0, 12)}...{publicKey.toString().slice(-12)}
          </div>
        </motion.div>
      )}

      {!connected && !connecting && (
        <motion.div
          key="disconnected"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-3 text-sm text-muted-foreground"
        >
          <div className="w-3 h-3 bg-muted-foreground/50 rounded-full" />
          <span>Not connected</span>
          <Badge className="bg-muted/20 text-muted-foreground border-muted/30 text-xs">
            <AlertCircle className="w-2 h-2 mr-1" />
            Offline
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
