'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

// Skeleton loader for price cards
export function PriceCardSkeleton() {
  return (
    <Card className="glassmorphism border-neon-orange/30">
      <CardContent className="p-6 text-center">
        <div className="space-y-3">
          <motion.div
            className="h-8 bg-gradient-to-r from-neon-orange/20 to-neon-orange/40 rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-4 bg-muted/20 rounded mx-auto w-2/3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="h-3 bg-neon-green/30 rounded mx-auto w-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Shimmer effect for loading states
export function ShimmerLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// Trading signal skeleton
export function TradingSignalSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-nuclear-glow/20"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-3 h-3 rounded-full bg-neon-orange/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
            <div className="space-y-2">
              <div className="h-4 bg-muted/30 rounded w-16" />
              <div className="h-3 bg-muted/20 rounded w-12" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-4 bg-neon-green/30 rounded w-12" />
            <div className="h-3 bg-muted/20 rounded w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Bot performance skeleton
export function BotPerformanceSkeleton() {
  return (
    <Card className="glassmorphism border-nuclear-glow/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 bg-muted/20 rounded w-20" />
              <motion.div
                className="h-6 bg-nuclear-glow/40 rounded w-16"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <motion.div
              className="w-3 h-3 bg-neon-green rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-muted/20 rounded" />
                <motion.div
                  className="h-5 bg-neon-orange/30 rounded"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Progressive image loader
export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjEyMTIxIi8+Cjwvc3ZnPgo='
}: {
  src: string
  alt: string
  className?: string
  placeholder?: string
}) {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <motion.img
        src={placeholder}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {/* Shimmer effect while loading */}
      {!loaded && !error && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground text-xs">
          Failed to load
        </div>
      )}
    </div>
  )
}

// Loading spinner with nuclear theme
export function NuclearSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-neon-orange/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-orange" />
      <motion.div
        className="absolute inset-1 rounded-full bg-nuclear-glow/20"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}

// Typing indicator for chat-like interfaces
export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-muted-foreground">Hydra Bot is analyzing</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-neon-orange rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Success animation
export function SuccessAnimation({
  show,
  onComplete
}: {
  show: boolean
  onComplete?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: show ? 1 : 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 10 }}
      >
        <div className="w-24 h-24 rounded-full nuclear-gradient flex items-center justify-center">
          <motion.svg
            className="w-12 h-12 text-background"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: show ? 1 : 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </div>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-neon-orange"
          initial={{ scale: 1, opacity: 1 }}
          animate={show ? { scale: 2, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.div>
    </motion.div>
  )
}
