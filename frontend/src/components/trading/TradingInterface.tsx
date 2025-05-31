'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGamification } from '@/components/gamification/AchievementSystem'
import { useHydraBot } from '@/hooks/useHydraBot'
import { HydraBotDashboard } from './HydraBotDashboard'
import {
  TrendingUp,
  TrendingDown,
  Bot,
  Zap,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Wallet,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
  Flame
} from 'lucide-react'

interface TradingPair {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdate: Date
}

interface AISignal {
  id: string
  pair: string
  type: 'BUY' | 'SELL'
  confidence: number
  entry: number
  target: number
  stopLoss: number
  reason: string
  timestamp: Date
  status: 'active' | 'filled' | 'stopped' | 'expired'
  pnl?: number
}

interface Portfolio {
  totalValue: number
  pnl24h: number
  pnlPercent: number
  positions: {
    symbol: string
    amount: number
    value: number
    pnl: number
    pnlPercent: number
  }[]
}

interface Order {
  id: string
  pair: string
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  filled: number
  status: 'pending' | 'partial' | 'filled' | 'cancelled'
  timestamp: Date
}

const mockTradingPairs: TradingPair[] = [
  {
    symbol: 'SOL/USDC',
    price: 142.85,
    change24h: 5.24,
    volume24h: 24580000,
    high24h: 148.92,
    low24h: 138.45,
    lastUpdate: new Date()
  },
  {
    symbol: 'BOOMROACH/SOL',
    price: 0.000087,
    change24h: 234.5,
    volume24h: 1250000,
    high24h: 0.000095,
    low24h: 0.000025,
    lastUpdate: new Date()
  },
  {
    symbol: 'ETH/USDC',
    price: 3840.12,
    change24h: -2.18,
    volume24h: 45200000,
    high24h: 3925.88,
    low24h: 3820.45,
    lastUpdate: new Date()
  },
  {
    symbol: 'BTC/USDC',
    price: 97240.50,
    change24h: 1.85,
    volume24h: 125600000,
    high24h: 98450.75,
    low24h: 95200.30,
    lastUpdate: new Date()
  }
]

const mockAISignals: AISignal[] = [
  {
    id: 'signal-1',
    pair: 'SOL/USDC',
    type: 'BUY',
    confidence: 94.7,
    entry: 142.50,
    target: 155.80,
    stopLoss: 138.20,
    reason: 'Strong momentum breakout + RSI oversold recovery + Volume spike detected',
    timestamp: new Date(Date.now() - 300000),
    status: 'active'
  },
  {
    id: 'signal-2',
    pair: 'BOOMROACH/SOL',
    type: 'BUY',
    confidence: 89.3,
    entry: 0.000085,
    target: 0.000120,
    stopLoss: 0.000078,
    reason: 'Accumulation pattern + Social sentiment surge + Whale activity',
    timestamp: new Date(Date.now() - 600000),
    status: 'filled',
    pnl: 15.8
  },
  {
    id: 'signal-3',
    pair: 'ETH/USDC',
    type: 'SELL',
    confidence: 78.2,
    entry: 3860.00,
    target: 3720.00,
    stopLoss: 3920.00,
    reason: 'Resistance rejection + Bearish divergence + Profit taking signals',
    timestamp: new Date(Date.now() - 900000),
    status: 'active'
  }
]

export function TradingInterface() {
  const { connected, publicKey } = useWallet()
  const { updateStats, unlockAchievement, addXP } = useGamification()
  const [selectedPair, setSelectedPair] = useState<TradingPair>(mockTradingPairs[0])
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>(mockTradingPairs)
  const [aiSignals, setAISignals] = useState<AISignal[]>(mockAISignals)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState('trade')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 12485.67,
    pnl24h: 847.32,
    pnlPercent: 7.25,
    positions: [
      { symbol: 'BOOMROACH', amount: 125000, value: 8420.50, pnl: 520.30, pnlPercent: 6.6 },
      { symbol: 'SOL', amount: 25.5, value: 3640.25, pnl: 180.45, pnlPercent: 5.2 },
      { symbol: 'USDC', amount: 425.92, value: 425.92, pnl: 0, pnlPercent: 0 }
    ]
  })

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTradingPairs(prev => prev.map(pair => ({
        ...pair,
        price: pair.price * (1 + (Math.random() - 0.5) * 0.01),
        lastUpdate: new Date()
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const executeOrder = async () => {
    if (!connected || !amount) return

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      pair: selectedPair.symbol,
      type: tradeType,
      amount: Number.parseFloat(amount),
      price: orderType === 'limit' ? Number.parseFloat(price) : selectedPair.price,
      filled: 0,
      status: 'pending',
      timestamp: new Date()
    }

    setOrders(prev => [newOrder, ...prev])

    // Simulate order execution
    setTimeout(() => {
      setOrders(prev => prev.map(order =>
        order.id === newOrder.id
          ? { ...order, status: 'filled', filled: order.amount }
          : order
      ))

      // Update portfolio
      setPortfolio(prev => ({
        ...prev,
        totalValue: prev.totalValue + (tradeType === 'BUY' ? -1 : 1) * newOrder.amount * newOrder.price
      }))

      // Update gamification
      updateStats('totalTrades', 1)
      addXP(50)

      // Unlock achievements
      if (orders.length === 0) {
        unlockAchievement('first-trade')
      }
      if (orders.length >= 9) {
        unlockAchievement('trader-veteran')
      }
    }, Math.random() * 3000 + 1000)

    // Clear form
    setAmount('')
    setPrice('')
  }

  const followAISignal = (signal: AISignal) => {
    setSelectedPair(tradingPairs.find(p => p.symbol === signal.pair) || tradingPairs[0])
    setTradeType(signal.type)
    setOrderType('limit')
    setPrice(signal.entry.toString())
    setActiveTab('trade')

    // Unlock AI achievement
    unlockAchievement('ai-follower')
    addXP(25)
  }

  if (!connected) {
    return (
      <Card className="glassmorphism border-neon-orange/30">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Wallet className="w-16 h-16 text-neon-orange mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-neon-orange mb-2">Connect Wallet to Trade</h3>
            <p className="text-muted-foreground">
              Connect your Solana wallet to access advanced trading features with Hydra AI Bot
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
              <Bot className="w-8 h-8 text-neon-blue mx-auto mb-2" />
              <div className="font-semibold text-neon-blue">AI Trading Signals</div>
              <div className="text-muted-foreground">94.7% win rate</div>
            </div>
            <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/30">
              <Shield className="w-8 h-8 text-neon-green mx-auto mb-2" />
              <div className="font-semibold text-neon-green">Secure Trading</div>
              <div className="text-muted-foreground">Non-custodial</div>
            </div>
            <div className="p-4 rounded-lg bg-nuclear-glow/10 border border-nuclear-glow/30">
              <Zap className="w-8 h-8 text-nuclear-glow mx-auto mb-2" />
              <div className="font-semibold text-nuclear-glow">Real-time Data</div>
              <div className="text-muted-foreground">Live updates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="glassmorphism border-neon-green/30">
        <CardHeader>
          <CardTitle className="flex items-center text-neon-green">
            <BarChart3 className="w-5 h-5 mr-2" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green">
                ${portfolio.totalValue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${portfolio.pnl24h >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {portfolio.pnl24h >= 0 ? '+' : ''}${portfolio.pnl24h.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">24h P&L</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${portfolio.pnlPercent >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {portfolio.pnlPercent >= 0 ? '+' : ''}{portfolio.pnlPercent.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">24h Change</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-blue">
                {portfolio.positions.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Positions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trading Interface */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="hydra-bot">Hydra Bot</TabsTrigger>
              <TabsTrigger value="ai-signals">AI Signals</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
            </TabsList>

            <TabsContent value="trade">
              <Card className="glassmorphism border-neon-orange/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center text-neon-orange">
                      <Activity className="w-5 h-5 mr-2" />
                      Trade {selectedPair.symbol}
                    </span>
                    <Badge className={`${selectedPair.change24h >= 0 ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                      {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="text-xl font-bold">${selectedPair.price.toFixed(6)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">24h High</div>
                      <div className="text-lg font-semibold text-neon-green">${selectedPair.high24h.toFixed(6)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">24h Low</div>
                      <div className="text-lg font-semibold text-red-400">${selectedPair.low24h.toFixed(6)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Volume</div>
                      <div className="text-lg font-semibold">${(selectedPair.volume24h / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>

                  {/* Order Form */}
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Button
                        variant={tradeType === 'BUY' ? 'default' : 'outline'}
                        onClick={() => setTradeType('BUY')}
                        className={`flex-1 ${tradeType === 'BUY' ? 'bg-neon-green/20 text-neon-green border-neon-green' : 'border-neon-green text-neon-green hover:bg-neon-green/10'}`}
                      >
                        BUY
                      </Button>
                      <Button
                        variant={tradeType === 'SELL' ? 'default' : 'outline'}
                        onClick={() => setTradeType('SELL')}
                        className={`flex-1 ${tradeType === 'SELL' ? 'bg-red-400/20 text-red-400 border-red-400' : 'border-red-400 text-red-400 hover:bg-red-400/10'}`}
                      >
                        SELL
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant={orderType === 'market' ? 'default' : 'outline'}
                        onClick={() => setOrderType('market')}
                        className="flex-1"
                      >
                        Market
                      </Button>
                      <Button
                        variant={orderType === 'limit' ? 'default' : 'outline'}
                        onClick={() => setOrderType('limit')}
                        className="flex-1"
                      >
                        Limit
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Amount</label>
                        <Input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                        />
                      </div>

                      {orderType === 'limit' && (
                        <div>
                          <label className="text-sm text-muted-foreground">Price</label>
                          <Input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={selectedPair.price.toFixed(6)}
                            type="number"
                            step="0.000001"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={executeOrder}
                      disabled={!amount || (orderType === 'limit' && !price)}
                      className={`w-full text-lg py-6 ${
                        tradeType === 'BUY'
                          ? 'bg-neon-green/20 text-neon-green hover:bg-neon-green/30 border border-neon-green/30'
                          : 'bg-red-400/20 text-red-400 hover:bg-red-400/30 border border-red-400/30'
                      }`}
                    >
                      {tradeType} {selectedPair.symbol.split('/')[0]}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hydra-bot">
              <HydraBotDashboard />
            </TabsContent>

            <TabsContent value="ai-signals">
              <Card className="glassmorphism border-neon-blue/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-neon-blue">
                    <Bot className="w-5 h-5 mr-2" />
                    Hydra AI Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiSignals.map((signal) => (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg glassmorphism border border-neon-blue/20 hover:border-neon-blue/40 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${signal.type === 'BUY' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                              {signal.type}
                            </Badge>
                            <div>
                              <div className="font-semibold">{signal.pair}</div>
                              <div className="text-sm text-muted-foreground">
                                {signal.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-nuclear-glow" />
                              <span className="font-bold text-nuclear-glow">{signal.confidence}%</span>
                            </div>
                            <Badge className={`text-xs ${
                              signal.status === 'active' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' :
                              signal.status === 'filled' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                              'bg-red-400/20 text-red-400 border-red-400/30'
                            }`}>
                              {signal.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">Entry</div>
                            <div className="font-semibold">${signal.entry.toFixed(6)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Target</div>
                            <div className="font-semibold text-neon-green">${signal.target.toFixed(6)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Stop Loss</div>
                            <div className="font-semibold text-red-400">${signal.stopLoss.toFixed(6)}</div>
                          </div>
                        </div>

                        {signal.pnl && (
                          <div className="mb-3">
                            <Badge className={`${signal.pnl >= 0 ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                              P&L: {signal.pnl >= 0 ? '+' : ''}{signal.pnl.toFixed(2)}%
                            </Badge>
                          </div>
                        )}

                        <div className="text-sm text-muted-foreground mb-3">
                          <span className="font-semibold">Reason:</span> {signal.reason}
                        </div>

                        {signal.status === 'active' && (
                          <Button
                            onClick={() => followAISignal(signal)}
                            size="sm"
                            className="w-full bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 border border-neon-blue/30"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Follow Signal
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="glassmorphism border-nuclear-glow/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-nuclear-glow">
                    <Clock className="w-5 h-5 mr-2" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders yet. Place your first trade to get started!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge className={`${order.type === 'BUY' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                              {order.type}
                            </Badge>
                            <div>
                              <div className="font-semibold">{order.pair}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.amount} @ ${order.price.toFixed(6)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`text-xs ${
                              order.status === 'filled' ? 'bg-neon-green/20 text-neon-green border-neon-green/30' :
                              order.status === 'pending' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' :
                              'bg-red-400/20 text-red-400 border-red-400/30'
                            }`}>
                              {order.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {order.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="positions">
              <Card className="glassmorphism border-neon-green/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-neon-green">
                    <PieChart className="w-5 h-5 mr-2" />
                    Current Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio.positions.map((position) => (
                      <div
                        key={position.symbol}
                        className="p-4 rounded-lg glassmorphism border border-neon-green/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{position.symbol}</div>
                          <Badge className={`${position.pnl >= 0 ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                            {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Amount</div>
                            <div className="font-semibold">{position.amount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Value</div>
                            <div className="font-semibold">${position.value.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">P&L</div>
                            <div className={`font-semibold ${position.pnl >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                              {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Market Data Sidebar */}
        <div className="space-y-6">
          <Card className="glassmorphism border-neon-orange/30">
            <CardHeader>
              <CardTitle className="flex items-center text-neon-orange">
                <TrendingUp className="w-5 h-5 mr-2" />
                Markets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tradingPairs.map((pair) => (
                  <motion.div
                    key={pair.symbol}
                    onClick={() => setSelectedPair(pair)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPair.symbol === pair.symbol
                        ? 'bg-neon-orange/20 border border-neon-orange/30'
                        : 'bg-background/50 hover:bg-background/80 border border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pair.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          Vol: ${(pair.volume24h / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${pair.price.toFixed(6)}</div>
                        <div className={`text-sm ${pair.change24h >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                          {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glassmorphism border-nuclear-glow/30">
            <CardHeader>
              <CardTitle className="flex items-center text-nuclear-glow">
                <Activity className="w-5 h-5 mr-2" />
                Trading Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-nuclear-glow">94.7%</div>
                  <div className="text-sm text-muted-foreground">AI Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-green">{orders.length}</div>
                  <div className="text-sm text-muted-foreground">Total Trades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-blue">3</div>
                  <div className="text-sm text-muted-foreground">Active Signals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
