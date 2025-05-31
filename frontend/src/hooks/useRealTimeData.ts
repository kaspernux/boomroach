import { useState, useEffect, useCallback } from 'react'

interface RealTimePriceData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  lastUpdate: Date
}

interface CommunityMetrics {
  onlineUsers: number
  totalHolders: number
  messagesLast24h: number
  activeTrades: number
  communityScore: number
  socialSentiment: 'bullish' | 'bearish' | 'neutral'
  lastUpdate: Date
}

interface TradingMetrics {
  totalVolume24h: number
  successfulTrades: number
  aiSignalsAccuracy: number
  avgProfitPerTrade: number
  topTraders: Array<{
    address: string
    profit24h: number
    winRate: number
  }>
  lastUpdate: Date
}

interface RealTimeData {
  prices: Record<string, RealTimePriceData>
  community: CommunityMetrics
  trading: TradingMetrics
  isConnected: boolean
  error: string | null
}

export function useRealTimeData() {
  const [data, setData] = useState<RealTimeData>({
    prices: {},
    community: {
      onlineUsers: 2847,
      totalHolders: 24789,
      messagesLast24h: 1256,
      activeTrades: 89,
      communityScore: 94.7,
      socialSentiment: 'bullish',
      lastUpdate: new Date()
    },
    trading: {
      totalVolume24h: 2450000,
      successfulTrades: 1847,
      aiSignalsAccuracy: 94.7,
      avgProfitPerTrade: 15.8,
      topTraders: [
        { address: '7xKp...4N2m', profit24h: 847.32, winRate: 96.2 },
        { address: 'Bx9L...8Wn3', profit24h: 623.45, winRate: 89.1 },
        { address: 'Mn4Q...7Yt8', profit24h: 512.67, winRate: 91.8 }
      ],
      lastUpdate: new Date()
    },
    isConnected: true,
    error: null
  })

  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const maxReconnectAttempts = 5

  // Simulate real-time price updates
  const simulatePriceUpdates = useCallback(() => {
    const symbols = ['BOOMROACH/SOL', 'SOL/USDC', 'ETH/USDC', 'BTC/USDC']
    const basePrices = {
      'BOOMROACH/SOL': 0.000087,
      'SOL/USDC': 142.85,
      'ETH/USDC': 3840.12,
      'BTC/USDC': 97240.50
    }

    const newPrices: Record<string, RealTimePriceData> = {}

    for (const symbol of symbols) {
      const basePrice = basePrices[symbol as keyof typeof basePrices]
      const priceChange = (Math.random() - 0.5) * 0.02 // ±1% change
      const newPrice = basePrice * (1 + priceChange)
      const change24h = (Math.random() - 0.3) * 20 // -6% to +14% range

      newPrices[symbol] = {
        symbol,
        price: newPrice,
        change24h,
        volume24h: Math.random() * 50000000,
        marketCap: newPrice * 1000000000, // Simplified calculation
        lastUpdate: new Date()
      }
    }

    return newPrices
  }, [])

  // Simulate community metrics updates
  const simulateCommunityUpdates = useCallback((): CommunityMetrics => {
    return {
      onlineUsers: Math.floor(2800 + Math.random() * 100),
      totalHolders: 24789 + Math.floor(Math.random() * 50),
      messagesLast24h: 1256 + Math.floor(Math.random() * 100),
      activeTrades: 89 + Math.floor(Math.random() * 20),
      communityScore: 94.7 + (Math.random() - 0.5) * 2,
      socialSentiment: Math.random() > 0.7 ? 'bullish' : Math.random() > 0.3 ? 'neutral' : 'bearish',
      lastUpdate: new Date()
    }
  }, [])

  // Simulate trading metrics updates
  const simulateTradingUpdates = useCallback((): TradingMetrics => {
    return {
      totalVolume24h: 2450000 + Math.random() * 500000,
      successfulTrades: 1847 + Math.floor(Math.random() * 50),
      aiSignalsAccuracy: 94.7 + (Math.random() - 0.5) * 1,
      avgProfitPerTrade: 15.8 + (Math.random() - 0.5) * 5,
      topTraders: [
        { address: '7xKp...4N2m', profit24h: 847.32 + (Math.random() - 0.5) * 100, winRate: 96.2 },
        { address: 'Bx9L...8Wn3', profit24h: 623.45 + (Math.random() - 0.5) * 100, winRate: 89.1 },
        { address: 'Mn4Q...7Yt8', profit24h: 512.67 + (Math.random() - 0.5) * 100, winRate: 91.8 }
      ],
      lastUpdate: new Date()
    }
  }, [])

  // Connect to WebSocket (simulated)
  const connectWebSocket = useCallback(() => {
    try {
      // In a real implementation, this would connect to actual WebSocket
      // For demo purposes, we'll simulate with intervals

      setData(prev => ({
        ...prev,
        isConnected: true,
        error: null
      }))

      setReconnectAttempts(0)

      // Simulate incoming data
      const interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          prices: simulatePriceUpdates(),
          community: simulateCommunityUpdates(),
          trading: simulateTradingUpdates(),
          lastUpdate: new Date()
        }))
      }, 3000) // Update every 3 seconds

      return () => clearInterval(interval)
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      setData(prev => ({
        ...prev,
        isConnected: false,
        error: 'Connection failed'
      }))
    }
  }, [simulatePriceUpdates, simulateCommunityUpdates, simulateTradingUpdates])

  // Reconnect logic
  const reconnect = useCallback(() => {
    if (reconnectAttempts < maxReconnectAttempts) {
      setReconnectAttempts(prev => prev + 1)
      setTimeout(() => {
        connectWebSocket()
      }, 2 ** reconnectAttempts * 1000) // Exponential backoff
    }
  }, [reconnectAttempts, connectWebSocket])

  // Initialize connection
  useEffect(() => {
    const cleanup = connectWebSocket()

    return cleanup
  }, [connectWebSocket])

  // Handle connection errors
  useEffect(() => {
    if (!data.isConnected && reconnectAttempts < maxReconnectAttempts) {
      reconnect()
    }
  }, [data.isConnected, reconnect, reconnectAttempts])

  // Get specific price data
  const getPriceData = useCallback((symbol: string): RealTimePriceData | null => {
    return data.prices[symbol] || null
  }, [data.prices])

  // Get market summary
  const getMarketSummary = useCallback(() => {
    const prices = Object.values(data.prices)
    if (prices.length === 0) return null

    const totalVolume = prices.reduce((sum, price) => sum + price.volume24h, 0)
    const avgChange = prices.reduce((sum, price) => sum + price.change24h, 0) / prices.length
    const bullishCount = prices.filter(price => price.change24h > 0).length

    return {
      totalVolume,
      avgChange,
      bullishPercentage: (bullishCount / prices.length) * 100,
      activePairs: prices.length
    }
  }, [data.prices])

  // Subscribe to specific symbol updates
  const subscribeToSymbol = useCallback((symbol: string, callback: (data: RealTimePriceData) => void) => {
    const interval = setInterval(() => {
      const priceData = getPriceData(symbol)
      if (priceData) {
        callback(priceData)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [getPriceData])

  // Track API call metrics
  const trackMetric = useCallback((event: string, value?: number) => {
    // In a real implementation, this would send metrics to analytics
    console.log(`Metric tracked: ${event}`, value)
  }, [])

  return {
    data,
    getPriceData,
    getMarketSummary,
    subscribeToSymbol,
    trackMetric,
    reconnect,
    isConnected: data.isConnected,
    error: data.error
  }
}
