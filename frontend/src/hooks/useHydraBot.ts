'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { io, type Socket } from 'socket.io-client'

interface HydraBotConfig {
  isActive: boolean
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
  maxTradeAmount: number
  maxDailyLoss: number
  autoSniper: boolean
  autoReentry: boolean
  stopLossPercentage: number
  takeProfitPercentage: number
  enabledTokens: string[]
  telegramNotifications: boolean
}

interface TradingSignal {
  id: string
  token: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  price: number
  reasoning: string
  timestamp: Date
  aiScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  expectedProfit: number
  liquidityScore: number
}

interface Portfolio {
  totalValue: number
  totalPnL: number
  totalPnLPercentage: number
  dailyPnL: number
  weeklyPnL: number
  monthlyPnL: number
  positions: Position[]
  trades: Trade[]
  performance: PerformanceMetrics
}

interface Position {
  token: string
  symbol: string
  amount: number
  value: number
  pnl: number
  pnlPercentage: number
  averagePrice: number
  currentPrice: number
  lastUpdated: Date
}

interface Trade {
  id: string
  token: string
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  value: number
  fee: number
  pnl?: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  signature?: string
  timestamp: Date
  strategy: 'MANUAL' | 'SNIPER' | 'REENTRY' | 'AI_SIGNAL'
  confidence?: number
}

interface PerformanceMetrics {
  totalTrades: number
  successfulTrades: number
  winRate: number
  avgProfitPerTrade: number
  avgLossPerTrade: number
  bestTrade: number
  worstTrade: number
  sharpeRatio: number
  maxDrawdown: number
  profitFactor: number
}

interface HydraBotStats {
  isConnected: boolean
  lastSignalTime: Date | null
  tradesExecuted: number
  successRate: number
  dailyPnL: number
  weeklyPnL: number
  totalProfit: number
  activeSignals: number
  riskScore: number
  botVersion: string
  uptime: number
}

interface RiskAlert {
  id: string
  type: 'STOP_LOSS' | 'MAX_LOSS' | 'HIGH_RISK' | 'SYSTEM_ERROR' | 'SUSPICIOUS_TOKEN'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  token?: string
  action: string
  timestamp: Date
  acknowledged: boolean
}

export function useHydraBot() {
  const { publicKey, signMessage } = useWallet()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)

  // Bot State
  const [config, setConfig] = useState<HydraBotConfig>({
    isActive: false,
    riskLevel: 'moderate',
    maxTradeAmount: 100,
    maxDailyLoss: 50,
    autoSniper: false,
    autoReentry: false,
    stopLossPercentage: 10,
    takeProfitPercentage: 25,
    enabledTokens: [],
    telegramNotifications: true
  })

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<HydraBotStats | null>(null)
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

  // Authentication
  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected')
    }

    try {
      setIsLoading(true)
      setError(null)

      // Create authentication message
      const message = `BoomRoach Hydra Bot Authentication\nTimestamp: ${Date.now()}\nWallet: ${publicKey.toBase58()}`
      const messageBytes = new TextEncoder().encode(message)
      const signature = await signMessage(messageBytes)

      // Send to backend
      const response = await fetch(`${API_BASE}/api/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          signature: Array.from(signature),
          message
        })
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      const data = await response.json()
      setAuthToken(data.token)
      setIsAuthenticated(true)

      // Store in localStorage for persistence
      localStorage.setItem('hydra-bot-token', data.token)

      return data.token
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, signMessage])

  // WebSocket Connection
  const connectWebSocket = useCallback(async () => {
    if (!authToken) return

    try {
      const newSocket = io(WS_URL, {
        auth: { token: authToken },
        transports: ['websocket'],
        timeout: 10000
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
        console.log('Hydra Bot WebSocket connected')
      })

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false)
        console.log('Hydra Bot WebSocket disconnected:', reason)

        if (reason === 'io server disconnect') {
          // Server disconnected, attempt reconnect
          setTimeout(connectWebSocket, 1000)
        }
      })

      newSocket.on('connect_error', (error) => {
        setError(`Connection failed: ${error.message}`)
        setIsConnected(false)

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          setTimeout(connectWebSocket, 2 ** reconnectAttempts.current * 1000)
        }
      })

      // Trading Events
      newSocket.on('trading_signal', (signal: TradingSignal) => {
        setSignals(prev => [signal, ...prev.slice(0, 49)]) // Keep last 50 signals

        // Show notification for high confidence signals
        if (signal.confidence > 85 && config.telegramNotifications) {
          showNotification('High Confidence Signal', `${signal.token}: ${signal.action} (${signal.confidence}%)`)
        }
      })

      newSocket.on('trade_executed', (trade: Trade) => {
        setTrades(prev => [trade, ...prev])
        updatePortfolio()

        // Show trade notification
        showNotification('Trade Executed', `${trade.type} ${trade.token} for $${trade.value.toFixed(2)}`)
      })

      newSocket.on('portfolio_update', (portfolioData: Portfolio) => {
        setPortfolio(portfolioData)
      })

      newSocket.on('risk_alert', (alert: RiskAlert) => {
        setRiskAlerts(prev => [alert, ...prev])

        // Show critical alerts immediately
        if (alert.severity === 'CRITICAL') {
          showNotification('CRITICAL RISK ALERT', alert.message, 'error')
        }
      })

      newSocket.on('bot_stats', (statsData: HydraBotStats) => {
        setStats(statsData)
      })

      setSocket(newSocket)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [authToken, config.telegramNotifications])

  // Initialize connection
  useEffect(() => {
    const storedToken = localStorage.getItem('hydra-bot-token')
    if (storedToken && publicKey) {
      setAuthToken(storedToken)
      setIsAuthenticated(true)
    }
  }, [publicKey])

  useEffect(() => {
    if (authToken && !socket) {
      connectWebSocket()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [authToken, connectWebSocket])

  // API Functions
  const updatePortfolio = useCallback(async () => {
    if (!authToken) return

    try {
      const response = await fetch(`${API_BASE}/api/trading/portfolio`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio)
      }
    } catch (error) {
      console.error('Failed to update portfolio:', error)
    }
  }, [authToken])

  const updateBotConfig = useCallback(async (newConfig: Partial<HydraBotConfig>) => {
    if (!authToken) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/api/trading/config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
      })

      if (response.ok) {
        const updatedConfig = { ...config, ...newConfig }
        setConfig(updatedConfig)

        // Notify WebSocket about config change
        if (socket) {
          socket.emit('config_update', updatedConfig)
        }

        return true
      }
      return false
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update config')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [authToken, config, socket])

  const executeTrade = useCallback(async (
    token: string,
    action: 'BUY' | 'SELL',
    amount: number,
    slippage = 1
  ) => {
    if (!authToken) throw new Error('Not authenticated')

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/api/trading/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          action,
          amount,
          slippage,
          strategy: 'MANUAL'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Trade execution failed')
      }

      const trade = await response.json()
      setTrades(prev => [trade, ...prev])
      updatePortfolio()

      return trade
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Trade execution failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [authToken, updatePortfolio])

  const startBot = useCallback(async () => {
    return updateBotConfig({ isActive: true })
  }, [updateBotConfig])

  const stopBot = useCallback(async () => {
    return updateBotConfig({ isActive: false })
  }, [updateBotConfig])

  const getTradeHistory = useCallback(async (limit = 50) => {
    if (!authToken) return []

    try {
      const response = await fetch(`${API_BASE}/api/trading/history?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTrades(data.trades)
        return data.trades
      }
      return []
    } catch (error) {
      console.error('Failed to fetch trade history:', error)
      return []
    }
  }, [authToken])

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setRiskAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, acknowledged: true }
          : alert
      )
    )

    if (socket) {
      socket.emit('acknowledge_alert', alertId)
    }
  }, [socket])

  const requestSignal = useCallback(async (token: string) => {
    if (!socket) return

    socket.emit('request_signal', { token })
  }, [socket])

  // Utility Functions
  const showNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    }
  }

  // Request notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return {
    // Authentication
    authenticate,
    isAuthenticated,
    isConnected,

    // Bot State
    config,
    updateBotConfig,
    startBot,
    stopBot,

    // Trading
    portfolio,
    signals,
    trades,
    stats,
    executeTrade,
    requestSignal,
    getTradeHistory,

    // Risk Management
    riskAlerts,
    acknowledgeAlert,

    // System State
    isLoading,
    error,
    setError: (error: string | null) => setError(error),

    // Utilities
    updatePortfolio,
    reconnect: connectWebSocket
  }
}
