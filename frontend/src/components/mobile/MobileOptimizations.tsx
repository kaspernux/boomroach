"use client";

import type React from "react";
import { memo, useState, useEffect } from "react";
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mobile navigation with gesture support
interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const MobileNav: React.FC<MobileNavProps> = memo(({ isOpen, onToggle, children }) => {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 100], [1, 0]);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      onToggle();
    }
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="md:hidden fixed top-4 right-4 z-50 bg-zinc-900/80 backdrop-blur-sm"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      
      {/* Mobile menu overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Mobile menu */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 200 }}
        onDragEnd={handleDragEnd}
        style={{ y, opacity }}
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed top-0 right-0 w-80 h-full bg-gradient-to-b from-zinc-900 to-zinc-800 
                 border-l border-zinc-700 z-50 md:hidden overflow-y-auto"
      >
        <div className="p-6 pt-16">
          <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-6" />
          {children}
        </div>
      </motion.div>
    </>
  );
});

MobileNav.displayName = "MobileNav";

// Touch-friendly swipe cards
interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeCard: React.FC<SwipeCardProps> = memo(({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ""
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100 && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -100 && onSwipeLeft) {
      onSwipeLeft();
    }
  };
  
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
      className={`cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </motion.div>
  );
});

SwipeCard.displayName = "SwipeCard";

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = memo(({
  onRefresh,
  children,
  className = ""
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, 100], [0, 180]);
  
  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };
  
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      style={{ y }}
      onDragEnd={handleDragEnd}
      className={className}
    >
      <motion.div
        style={{ rotate }}
        className="flex justify-center py-4"
      >
        <ChevronDown className={`w-6 h-6 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
      </motion.div>
      {children}
    </motion.div>
  );
});

PullToRefresh.displayName = "PullToRefresh";

// Mobile-optimized touch targets
export const TouchTarget: React.FC<{
  children: React.ReactNode;
  onTap?: () => void;
  className?: string;
}> = memo(({ children, onTap, className = "" }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onTap={onTap}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`}
    >
      {children}
    </motion.div>
  );
});

TouchTarget.displayName = "TouchTarget";

// Mobile viewport detector
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    window.addEventListener('orientationchange', checkViewport);
    
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('orientationchange', checkViewport);
    };
  }, []);
  
  return { isMobile, orientation };
};

// Mobile-specific animations
export const MobileAnimations = {
  slideUp: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
    transition: { type: "spring", damping: 20 }
  },
  
  fadeInUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6 }
  },
  
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

// Mobile performance optimization
export const MobilePerformanceWrapper: React.FC<{
  children: React.ReactNode;
}> = memo(({ children }) => {
  useEffect(() => {
    // Optimize for mobile performance
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    
    // Preload critical resources on mobile
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/api/price-feeds';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return <>{children}</>;
});

MobilePerformanceWrapper.displayName = "MobilePerformanceWrapper";