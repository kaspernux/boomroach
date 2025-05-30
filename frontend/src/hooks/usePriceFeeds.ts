"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface PriceData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders?: number;
}

interface JupiterPriceResponse {
  data: {
    [key: string]: {
      id: string;
      mintSymbol: string;
      vsToken: string;
      vsTokenSymbol: string;
      price: number;
    };
  };
}

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export function usePriceFeeds(tokenAddress?: string) {
  const [priceData, setPriceData] = useState<PriceData>({
    price: 0.000042,
    marketCap: 4200000,
    volume24h: 150000,
    priceChange24h: 234.5,
    holders: 12483,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock BoomRoach token address (replace with real one)
  const BOOMROACH_TOKEN =
    tokenAddress || "FuYwSQfuLpAA36RqvKUDqw7x8Yjs2b1yRdtvwGq6pump";

  const fetchPriceFromJupiter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Jupiter Price API v2
      const response = await axios.get<JupiterPriceResponse>(
        `https://price.jup.ag/v6/price?ids=${BOOMROACH_TOKEN}`,
      );

      if (response.data?.data?.[BOOMROACH_TOKEN]) {
        const tokenData = response.data.data[BOOMROACH_TOKEN];
        return {
          price: tokenData.price,
          symbol: tokenData.mintSymbol,
        };
      }

      return null;
    } catch (err) {
      console.warn("Jupiter API error:", err);
      return null;
    }
  }, [BOOMROACH_TOKEN]);

  const fetchTokenMetrics = useCallback(async () => {
    try {
      // Try to get additional metrics from DexScreener
      const response = await axios.get(
        `https://api.dexscreener.com/latest/dex/tokens/${BOOMROACH_TOKEN}`,
      );

      if (response.data?.pairs && response.data.pairs.length > 0) {
        const pair = response.data.pairs[0];
        return {
          price: Number.parseFloat(pair.priceUsd || "0"),
          marketCap: Number.parseFloat(pair.fdv || "0"),
          volume24h: Number.parseFloat(pair.volume24h || "0"),
          priceChange24h: Number.parseFloat(pair.priceChange24h || "0"),
        };
      }

      return null;
    } catch (err) {
      console.warn("DexScreener API error:", err);
      return null;
    }
  }, [BOOMROACH_TOKEN]);

  const updatePriceData = useCallback(async () => {
    try {
      setLoading(true);

      // Try Jupiter first
      const jupiterData = await fetchPriceFromJupiter();

      // Try DexScreener for additional metrics
      const metricsData = await fetchTokenMetrics();

      if (jupiterData || metricsData) {
        setPriceData((prev) => ({
          ...prev,
          price: jupiterData?.price || metricsData?.price || prev.price,
          marketCap: metricsData?.marketCap || prev.marketCap,
          volume24h: metricsData?.volume24h || prev.volume24h,
          priceChange24h: metricsData?.priceChange24h || prev.priceChange24h,
        }));
      } else {
        // If APIs fail, simulate live data for demo
        setPriceData((prev) => ({
          ...prev,
          price: prev.price + (Math.random() - 0.5) * 0.000001,
          marketCap: prev.marketCap + (Math.random() - 0.5) * 10000,
          holders: (prev.holders || 12483) + Math.floor(Math.random() * 3),
        }));
      }
    } catch (err) {
      setError("Failed to fetch price data");
      console.error("Price fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchPriceFromJupiter, fetchTokenMetrics]);

  // Real-time updates every 10 seconds
  useEffect(() => {
    updatePriceData();

    const interval = setInterval(updatePriceData, 10000);
    return () => clearInterval(interval);
  }, [updatePriceData]);

  return {
    priceData,
    loading,
    error,
    refetch: updatePriceData,
  };
}

// Hook for multiple token prices
export function useMultiPriceFeeds(tokenAddresses: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const fetchMultiplePrices = useCallback(async () => {
    if (tokenAddresses.length === 0) return;

    try {
      setLoading(true);

      const idsParam = tokenAddresses.join(",");
      const response = await axios.get<JupiterPriceResponse>(
        `https://price.jup.ag/v6/price?ids=${idsParam}`,
      );

      if (response.data?.data) {
        const newPrices: Record<string, number> = {};

        for (const address of tokenAddresses) {
          if (response.data.data[address]) {
            newPrices[address] = response.data.data[address].price;
          }
        }

        setPrices(newPrices);
      }
    } catch (err) {
      console.error("Multi-price fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [tokenAddresses]);

  useEffect(() => {
    fetchMultiplePrices();

    const interval = setInterval(fetchMultiplePrices, 15000);
    return () => clearInterval(interval);
  }, [fetchMultiplePrices]);

  return { prices, loading, refetch: fetchMultiplePrices };
}
