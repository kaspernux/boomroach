'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  Bot,
  Activity,
  TrendingUp,
  BarChart3,
  Loader2,
  Zap,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react'

// Enhanced skeleton loader for price cards
export function PriceCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={`price-skeleton-${i}`} className="glassmorphism border-neon-orange/30">
          <CardContent className="p-6 text-center">
            <div className="space-y-3">
              <motion.div
                className="h-8 bg-gradient-to-r from-neon-orange/20 to-neon-orange/40 rounded"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2
                }}
              />
              <motion.div
                className="h-4 bg-muted/20 rounded mx-auto w-2/3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.2 + i * 0.1
                }}
              />
              <motion.div
                className="h-3 bg-neon-green/30 rounded mx-auto w-1/2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.4 + i * 0.1
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Advanced shimmer effect
export function ShimmerLoader({
  className = '',
  direction = 'horizontal',
  duration = 1.5
}: {
  className?: string
  direction?: 'horizontal' | 'vertical' | 'diagonal'
  duration?: number
}) {
  const getGradientDirection = () => {
    switch (direction) {
      case 'vertical':
        return { from: '0% 0%', to: '0% 100%' }
      case 'diagonal':
        return { from: '0% 0%', to: '100% 100%' }
      default:
        return { from: '0% 50%', to: '100% 50%' }
    }
  }

  const gradient = getGradientDirection()

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          backgroundPosition: [gradient.from, gradient.to, gradient.from]
        }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear'
        }}
        style={{
          backgroundSize: direction === 'horizontal' ? '200% 100%' : '100% 200%'
        }}
      />
    </div>
  )
}

// Enhanced trading signal skeleton
export function TradingSignalSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`signal-skeleton-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-nuclear-glow/20"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-3 h-3 rounded-full bg-neon-orange/50"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2
              }}
            />
            <div className="space-y-2">
              <ShimmerLoader className="h-4 bg-muted/30 rounded w-16" />
              <ShimmerLoader className="h-3 bg-muted/20 rounded w-12" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <ShimmerLoader className="h-4 bg-neon-green/30 rounded w-12" />
            <ShimmerLoader className="h-3 bg-muted/20 rounded w-8" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced bot performance skeleton
export function BotPerformanceSkeleton() {
  return (
    <Card className="glassmorphism border-nuclear-glow/30">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          >
            <Bot className="w-5 h-5 text-nuclear-glow" />
          </motion.div>
          <ShimmerLoader className="h-5 bg-muted/30 rounded w-32" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <ShimmerLoader className="h-3 bg-muted/20 rounded w-20" />
              <motion.div
                className="h-6 bg-nuclear-glow/40 rounded w-16"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
            <motion.div
              className="w-3 h-3 bg-neon-green rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`perf-skeleton-${i}`} className="space-y-2">
                <ShimmerLoader className="h-3 bg-muted/20 rounded" />
                <motion.div
                  className="h-5 bg-neon-orange/30 rounded"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.3
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Advanced error boundary component
interface ErrorStateProps {
  error?: Error | string
  onRetry?: () => void
  onReport?: () => void
  title?: string
  description?: string
  type?: 'network' | 'api' | 'wallet' | 'bot' | 'general'
}

export function ErrorState({
  error,
  onRetry,
  onReport,
  title,
  description,
  type = 'general'
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-12 h-12 text-red-400" />,
          defaultTitle: 'Connection Lost',
          defaultDescription: 'Unable to connect to the network. Check your internet connection.',
          color: 'red-400'
        }
      case 'api':
        return {
          icon: <Activity className="w-12 h-12 text-orange-400" />,
          defaultTitle: 'Service Unavailable',
          defaultDescription: 'Our servers are temporarily unavailable. Please try again in a moment.',
          color: 'orange-400'
        }
      case 'wallet':
        return {
          icon: <Shield className="w-12 h-12 text-purple-400" />,
          defaultTitle: 'Wallet Error',
          defaultDescription: 'There was an issue with your wallet connection.',
          color: 'purple-400'
        }
      case 'bot':
        return {
          icon: <Bot className="w-12 h-12 text-blue-400" />,
          defaultTitle: 'Hydra Bot Error',
          defaultDescription: 'The trading bot encountered an unexpected error.',
          color: 'blue-400'
        }
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-400" />,
          defaultTitle: 'Something went wrong',
          defaultDescription: 'An unexpected error occurred. Please try again.',
          color: 'red-400'
        }
    }
  }

  const config = getErrorConfig()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        animate={{
          rotate: [0, -5, 5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut'
        }}
        className="mb-4"
      >
        {config.icon}
      </motion.div>

      <h3 className={`text-xl font-semibold text-${config.color} mb-2`}>
        {title || config.defaultTitle}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md">
        {description || config.defaultDescription}
      </p>

      {typeof error === 'string' && (
        <Badge variant="outline" className="mb-4 text-xs font-mono">
          {error}
        </Badge>
      )}

      <div className="flex items-center space-x-3">
        {onRetry && (
          <Button onClick={onRetry} className="bg-nuclear-gradient hover-glow">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        {onReport && (
          <Button variant="outline" onClick={onReport}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// Connection status indicator
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSeen, setLastSeen] = useState<Date>(new Date())

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastSeen(new Date())
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection status periodically
    const interval = setInterval(() => {
      if (navigator.onLine) {
        setLastSeen(new Date())
      }
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="glassmorphism border-red-500/50 bg-red-500/10">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 text-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                >
                  <WifiOff className="w-4 h-4 text-red-400" />
                </motion.div>
                <span className="text-red-400 font-semibold">No internet connection</span>
                <Badge variant="outline" className="text-xs">
                  Last seen: {lastSeen.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Progressive image loader with advanced features
export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjEyMTIxIi8+Cjwvc3ZnPgo=',
  showLoadingProgress = false,
  onLoad,
  onError
}: {
  src: string
  alt: string
  className?: string
  placeholder?: string
  showLoadingProgress?: boolean
  onLoad?: () => void
  onError?: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    if (showLoadingProgress) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [showLoadingProgress])

  const handleLoad = () => {
    setLoaded(true)
    setLoadingProgress(100)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    onError?.()
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <motion.img
        src={placeholder}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {/* Loading progress */}
      {!loaded && !error && showLoadingProgress && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              className="w-8 h-8 border-2 border-neon-orange border-t-transparent rounded-full mx-auto mb-2"
            />
            <div className="text-sm text-neon-orange">{Math.round(loadingProgress)}%</div>
          </div>
        </div>
      )}

      {/* Shimmer effect while loading */}
      {!loaded && !error && !showLoadingProgress && (
        <ShimmerLoader className="absolute inset-0" />
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{
          opacity: loaded ? 1 : 0,
          scale: loaded ? 1 : 1.1
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground"
        >
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <div className="text-xs">Failed to load</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Advanced loading spinner with different themes
export function NuclearSpinner({
  size = 'md',
  theme = 'nuclear',
  text
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'nuclear' | 'roach' | 'bot' | 'rainbow'
  text?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const getThemeColors = () => {
    switch (theme) {
      case 'roach':
        return {
          primary: '#8B4513',
          secondary: '#ff9500',
          glow: 'rgba(255, 149, 0, 0.6)'
        }
      case 'bot':
        return {
          primary: '#00d9ff',
          secondary: '#39ff14',
          glow: 'rgba(0, 217, 255, 0.6)'
        }
      case 'rainbow':
        return {
          primary: 'url(#rainbow-gradient)',
          secondary: '#fff',
          glow: 'rgba(255, 255, 255, 0.6)'
        }
      default:
        return {
          primary: '#ff9500',
          secondary: '#ffff00',
          glow: 'rgba(255, 149, 0, 0.6)'
        }
    }
  }

  const colors = getThemeColors()

  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
      >
        <svg className="w-full h-full" viewBox="0 0 40 40">
          {theme === 'rainbow' && (
            <defs>
              <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff0000" />
                <stop offset="16.66%" stopColor="#ff9500" />
                <stop offset="33.33%" stopColor="#ffff00" />
                <stop offset="50%" stopColor="#39ff14" />
                <stop offset="66.66%" stopColor="#00d9ff" />
                <stop offset="83.33%" stopColor="#0000ff" />
                <stop offset="100%" stopColor="#8000ff" />
              </linearGradient>
            </defs>
          )}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke={colors.primary}
            strokeWidth="3"
            strokeDasharray="20 20"
            strokeLinecap="round"
          />
          <circle
            cx="20"
            cy="20"
            r="12"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="2"
            strokeDasharray="15 15"
            strokeLinecap="round"
          />
        </svg>

        <motion.div
          className="absolute inset-2 rounded-full"
          animate={{
            background: [
              `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              `radial-gradient(circle, transparent 0%, ${colors.glow} 70%)`,
              `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
            ]
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </motion.div>

      {text && (
        <motion.div
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          {text}
        </motion.div>
      )}
    </div>
  )
}

// Typing indicator for real-time features
export function TypingIndicator({
  text = 'Hydra Bot is analyzing',
  dotCount = 3,
  speed = 0.5
}: {
  text?: string
  dotCount?: number
  speed?: number
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">{text}</span>
      <div className="flex space-x-1">
        {Array.from({ length: dotCount }).map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="w-1 h-1 bg-neon-orange rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * speed
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Success/failure animation
export function StatusAnimation({
  show,
  type = 'success',
  title,
  description,
  onComplete,
  autoClose = true,
  duration = 3000
}: {
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  description?: string
  onComplete?: () => void
  autoClose?: boolean
  duration?: number
}) {
  const getStatusConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-neon-green" />,
          color: 'neon-green',
          defaultTitle: 'Success!',
          gradient: 'from-neon-green/20 to-neon-green/5'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-400" />,
          color: 'red-400',
          defaultTitle: 'Error!',
          gradient: 'from-red-400/20 to-red-400/5'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-orange-400" />,
          color: 'orange-400',
          defaultTitle: 'Warning!',
          gradient: 'from-orange-400/20 to-orange-400/5'
        }
      default:
        return {
          icon: <Activity className="w-12 h-12 text-neon-blue" />,
          color: 'neon-blue',
          defaultTitle: 'Info',
          gradient: 'from-neon-blue/20 to-neon-blue/5'
        }
    }
  }

  const config = getStatusConfig()

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, autoClose, duration, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            className={`relative p-8 rounded-xl glassmorphism border border-${config.color}/50 bg-gradient-to-br ${config.gradient} max-w-sm mx-4`}
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 15 }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="mb-4"
              >
                {config.icon}
              </motion.div>

              <h3 className={`text-xl font-semibold text-${config.color} mb-2`}>
                {title || config.defaultTitle}
              </h3>

              {description && (
                <p className="text-muted-foreground text-sm">
                  {description}
                </p>
              )}
            </div>

            {/* Ripple effect */}
            <motion.div
              className={`absolute inset-0 rounded-xl border-2 border-${config.color}/30`}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Retry mechanism with exponential backoff
export function useRetryWithBackoff(
  fn: () => Promise<unknown>,
  maxRetries = 3,
  baseDelay = 1000
) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const retry = async () => {
    setIsRetrying(true)
    setError(null)

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await fn()
        setRetryCount(0)
        setIsRetrying(false)
        return
      } catch (err) {
        setError(err as Error)
        setRetryCount(attempt + 1)

        if (attempt === maxRetries) {
          setIsRetrying(false)
          throw err
        }

        // Exponential backoff: wait 2^attempt * baseDelay ms
        const delay = baseDelay * 2 ** attempt
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return { retry, isRetrying, retryCount, error }
}
