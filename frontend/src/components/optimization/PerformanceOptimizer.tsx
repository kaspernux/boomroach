"use client";

import React, { memo, useMemo, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading utility
export const createLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props: T) => (
    <Suspense fallback={fallback || <Skeleton className="w-full h-32" />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// Virtual scrolling for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ""
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
});

VirtualScroll.displayName = "VirtualScroll";

// Memoized counter with animation
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = memo(({
  value,
  duration = 1000,
  className = "",
  prefix = "",
  suffix = ""
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const startValue = displayValue;
    const difference = value - startValue;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (difference * easeOut);
      
      setDisplayValue(Math.floor(currentValue));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, displayValue]);
  
  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
});

AnimatedCounter.displayName = "AnimatedCounter";

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const targetRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isLoaded) {
        setIsIntersecting(true);
        setIsLoaded(true);
      }
    }, {
      threshold: 0.1,
      ...options
    });
    
    observer.observe(target);
    
    return () => observer.disconnect();
  }, [isLoaded, options]);
  
  return { targetRef, isIntersecting, isLoaded };
};

// Performance monitoring component
export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  React.useEffect(() => {
    // Monitor performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    
    return () => observer.disconnect();
  }, []);
  
  return <>{children}</>;
});

PerformanceMonitor.displayName = "PerformanceMonitor";

// Bundle analyzer utility (development only)
export const BundleAnalyzer: React.FC = memo(() => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log bundle information
      console.log('Bundle analysis available at build time');
    }
  }, []);
  
  return null;
});

BundleAnalyzer.displayName = "BundleAnalyzer";