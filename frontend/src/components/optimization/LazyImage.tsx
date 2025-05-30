"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  placeholder?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src,
  alt,
  className = "",
  fallback = "/api/placeholder/400/300",
  placeholder
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
        >
          {placeholder || <Skeleton className="w-full h-full" />}
        </motion.div>
      )}
      
      {inView && (
        <motion.img
          src={error ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: loaded ? 1 : 0,
            scale: loaded ? 1 : 1.1
          }}
          transition={{ duration: 0.5 }}
          className={`w-full h-full object-cover ${loaded ? 'block' : 'absolute'}`}
        />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";