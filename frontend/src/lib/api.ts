"use client";

import axios from "axios";
import React, { useState } from "react";

// Types for API responses
export interface TradingSignal {
  id: string;
  token: string;
  pair: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  price: string;
  timestamp: number;
  reason: string;
  expectedReturn: number;
}

export interface BotPerformance {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  dailyPnL: number;
  activePositions: number;
  status: "ACTIVE" | "PAUSED" | "ERROR";
}

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  type: "REVENUE_SHARE" | "BURN_RATE" | "FEATURE" | "PARTNERSHIP";
  status: "ACTIVE" | "PASSED" | "REJECTED" | "PENDING";
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  approvalPercentage: number;
  endTime: number;
  createdAt: number;
}

export interface VoteTransaction {
  proposalId: string;
  vote: "FOR" | "AGAINST";
  amount: number;
  walletAddress: string;
}

// Mock data generators
const generateTradingSignal = (): TradingSignal => {
  const tokens = ["SOL/USDC", "RAY/SOL", "ORCA/USDC", "SRM/USDT", "SAMO/SOL"];
  const actions: Array<"BUY" | "SELL" | "HOLD"> = ["BUY", "SELL", "HOLD"];
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];

  return {
    id: Math.random().toString(36).substr(2, 9),
    token,
    pair: token,
    action,
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
    price: `$${(Math.random() * 100 + 1).toFixed(2)}`,
    timestamp: Date.now(),
    reason:
      action === "BUY"
        ? "Strong momentum detected"
        : action === "SELL"
          ? "Overbought conditions"
          : "Consolidation phase",
    expectedReturn: Math.random() * 20 + 5, // 5-25%
  };
};

const generateBotPerformance = (): BotPerformance => {
  return {
    totalTrades: 1247 + Math.floor(Math.random() * 10),
    winRate: 92.3 + Math.random() * 5, // 92-97%
    totalPnL: 47239.42 + Math.random() * 1000,
    dailyPnL: 2341.67 + Math.random() * 500,
    activePositions: Math.floor(Math.random() * 8) + 3,
    status: "ACTIVE",
  };
};

// API Service Class
export class HydraAPIService {
  private static instance: HydraAPIService;
  private baseUrl = "/api/hydra"; // Would be real API endpoint

  static getInstance(): HydraAPIService {
    if (!HydraAPIService.instance) {
      HydraAPIService.instance = new HydraAPIService();
    }
    return HydraAPIService.instance;
  }

  // Trading Signals
  async getTradingSignals(): Promise<TradingSignal[]> {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate mock signals
      return Array.from({ length: 5 }, generateTradingSignal);
    } catch (error) {
      console.error("Failed to fetch trading signals:", error);
      throw error;
    }
  }

  async getBotPerformance(): Promise<BotPerformance> {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      return generateBotPerformance();
    } catch (error) {
      console.error("Failed to fetch bot performance:", error);
      throw error;
    }
  }

  async startBot(): Promise<{ success: boolean; message: string }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: "Hydra Bot activated successfully" };
    } catch (error) {
      return { success: false, message: "Failed to start bot" };
    }
  }

  async stopBot(): Promise<{ success: boolean; message: string }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true, message: "Hydra Bot paused successfully" };
    } catch (error) {
      return { success: false, message: "Failed to stop bot" };
    }
  }
}

// DAO API Service
export class DAOAPIService {
  private static instance: DAOAPIService;
  private baseUrl = "/api/dao";

  static getInstance(): DAOAPIService {
    if (!DAOAPIService.instance) {
      DAOAPIService.instance = new DAOAPIService();
    }
    return DAOAPIService.instance;
  }

  async getProposals(): Promise<DAOProposal[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Mock proposals
      return [
        {
          id: "prop-001",
          title: "Increase Bot Revenue Share to 50%",
          description:
            "Proposal to increase the revenue sharing from Hydra Bot profits to token holders from 35% to 50%.",
          type: "REVENUE_SHARE",
          status: "ACTIVE",
          votesFor: 734,
          votesAgainst: 266,
          totalVotes: 1000,
          approvalPercentage: 73.4,
          endTime: Date.now() + 86400000 * 3, // 3 days
          createdAt: Date.now() - 86400000 * 2, // 2 days ago
        },
        {
          id: "prop-002",
          title: "Enable Cross-Chain Arbitrage Bot",
          description:
            "Deploy Hydra Bot on Ethereum and BSC for cross-chain arbitrage opportunities.",
          type: "FEATURE",
          status: "PASSED",
          votesFor: 892,
          votesAgainst: 108,
          totalVotes: 1000,
          approvalPercentage: 89.2,
          endTime: Date.now() - 86400000, // Ended yesterday
          createdAt: Date.now() - 86400000 * 7, // 7 days ago
        },
        {
          id: "prop-003",
          title: "Weekly Token Burn Increase",
          description:
            "Increase weekly token burn from 1% to 2% of treasury holdings.",
          type: "BURN_RATE",
          status: "ACTIVE",
          votesFor: 445,
          votesAgainst: 189,
          totalVotes: 634,
          approvalPercentage: 70.2,
          endTime: Date.now() + 86400000 * 5, // 5 days
          createdAt: Date.now() - 86400000, // 1 day ago
        },
      ];
    } catch (error) {
      console.error("Failed to fetch DAO proposals:", error);
      throw error;
    }
  }

  async submitVote(
    vote: VoteTransaction,
  ): Promise<{ success: boolean; txHash?: string; message: string }> {
    try {
      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txHash = `hydra_${Math.random().toString(36).substr(2, 16)}`;

      return {
        success: true,
        txHash,
        message: `Vote submitted successfully for proposal ${vote.proposalId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to submit vote",
      };
    }
  }

  async getUserVotingPower(
    walletAddress: string,
  ): Promise<{ power: number; tokens: number }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Mock voting power based on token holdings
      const tokens = Math.floor(Math.random() * 10000) + 1000;
      const power = tokens * 1.2; // 1.2x multiplier for voting

      return { power, tokens };
    } catch (error) {
      console.error("Failed to fetch voting power:", error);
      throw error;
    }
  }
}

// Real-time data hooks
export function useRealTimeSignals() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSignals = React.useCallback(async () => {
    try {
      setLoading(true);
      const hydraAPI = HydraAPIService.getInstance();
      const newSignals = await hydraAPI.getTradingSignals();
      setSignals(newSignals);
    } catch (error) {
      console.error("Failed to fetch signals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  return { signals, loading, refetch: fetchSignals };
}

export function useRealTimeBotPerformance() {
  const [performance, setPerformance] = useState<BotPerformance | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPerformance = React.useCallback(async () => {
    try {
      setLoading(true);
      const hydraAPI = HydraAPIService.getInstance();
      const data = await hydraAPI.getBotPerformance();
      setPerformance(data);
    } catch (error) {
      console.error("Failed to fetch bot performance:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 15000);
    return () => clearInterval(interval);
  }, [fetchPerformance]);

  return { performance, loading, refetch: fetchPerformance };
}
