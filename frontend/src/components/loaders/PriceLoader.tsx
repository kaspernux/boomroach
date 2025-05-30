"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const PriceLoader: React.FC = React.memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </motion.div>
  );
});

PriceLoader.displayName = "PriceLoader";

export const TradingSignalLoader: React.FC = React.memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </motion.div>
  );
});

TradingSignalLoader.displayName = "TradingSignalLoader";

export const ChartLoader: React.FC = React.memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-64 p-4"
    >
      <div className="w-full h-full relative">
        <Skeleton className="absolute bottom-0 left-0 w-1/6 h-1/3" />
        <Skeleton className="absolute bottom-0 left-1/6 w-1/6 h-2/3" />
        <Skeleton className="absolute bottom-0 left-2/6 w-1/6 h-1/2" />
        <Skeleton className="absolute bottom-0 left-3/6 w-1/6 h-4/5" />
        <Skeleton className="absolute bottom-0 left-4/6 w-1/6 h-3/5" />
        <Skeleton className="absolute bottom-0 left-5/6 w-1/6 h-full" />
      </div>
    </motion.div>
  );
});

ChartLoader.displayName = "ChartLoader";