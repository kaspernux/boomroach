'use client'

import React, { useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts'
import {
  Bot,
  Zap,
  TrendingUp,
  Activity,
  Target,
  Brain,
  Eye,
  Cpu,
  Wifi,
  DollarSign,
  RefreshCw,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flame,
  Shield,
  BarChart3,
  PieChart,
  TrendingDown,
  AlertCircle,
  Info,
  Gauge,
  Binary,
  Layers,
  Network,
  Calculator,
  Crosshair
} from 'lucide-react'
import { StaggerContainer, StaggerItem, ScaleOnHover, AnimatedCounter } from '@/components/animations/MobileAnimations'
import { useRealTimeSignals, useRealTimeBotPerformance } from '@/lib/api'
import { useGamification } from '@/components/gamification/AchievementSystem'

// Enhanced performance data with risk metrics
const performanceData = [
  { time: '00:00', pnl: 0, trades: 0, winRate: 0, sharpeRatio: 0, drawdown: 0, riskScore: 50 },
  { time: '04:00', pnl: 1250, trades: 23, winRate: 87, sharpeRatio: 1.2, drawdown: -2.1, riskScore: 35 },
  { time: '08:00', pnl: 2840, trades: 47, winRate: 91, sharpeRatio: 1.8, drawdown: -1.8, riskScore: 28 },
  { time: '12:00', pnl: 4120, trades: 72, winRate: 94, sharpeRatio: 2.1, drawdown: -1.2, riskScore: 22 },
  { time: '16:00', pnl: 5890, trades: 98, winRate: 96, sharpeRatio: 2.4, drawdown: -0.8, riskScore: 18 },
  { time: '20:00', pnl: 7234, trades: 127, winRate: 95, sharpeRatio: 2.2, drawdown: -1.5, riskScore: 25 },
  { time: '24:00', pnl: 8567, trades: 151, winRate: 94, sharpeRatio: 2.0, drawdown: -2.0, riskScore: 30 }
]

const riskMetrics = [
  { metric: 'Volatility', value: 85, max: 100, color: 'neon-orange' },
  { metric: 'Liquidity', value: 92, max: 100, color: 'neon-blue' },
  { metric: 'Slippage', value: 78, max: 100, color: 'neon-green' },
  { metric: 'Correlation', value: 65, max: 100, color: 'nuclear-glow' },
  { metric: 'Momentum', value: 88, max: 100, color: 'purple-400' },
  { metric: 'Mean Reversion', value: 71, max: 100, color: 'pink-400' }
]

const strategies = [
  {
    name: 'Arbitrage Scanner',
    description: 'Identifies price differences across DEXs',
    performance: 97.2,
    trades: 89,
    pnl: 12450,
    status: 'active',
    color: 'neon-green',
    risk: 'Low',
    allocation: 35,
    sharpeRatio: 2.4,
    maxDrawdown: -1.2,
    avgHoldTime: '4.2m'
  },
  {
    name: 'Momentum Trader',
    description: 'Follows strong price movements',
    performance: 92.8,
    trades: 156,
    pnl: 8923,
    status: 'active',
    color: 'neon-blue',
    risk: 'Medium',
    allocation: 25,
    sharpeRatio: 1.8,
    maxDrawdown: -3.1,
    avgHoldTime: '12.7m'
  },
  {
    name: 'Mean Reversion',
    description: 'Profits from price corrections',
    performance: 89.4,
    trades: 203,
    pnl: 6734,
    status: 'active',
    color: 'neon-orange',
    risk: 'Medium',
    allocation: 20,
    sharpeRatio: 1.6,
    maxDrawdown: -4.5,
    avgHoldTime: '8.3m'
  },
  {
    name: 'Liquidity Hunter',
    description: 'Exploits liquidity imbalances',
    performance: 94.6,
    trades: 67,
    pnl: 15672,
    status: 'paused',
    color: 'nuclear-glow',
    risk: 'High',
    allocation: 20,
    sharpeRatio: 2.8,
    maxDrawdown: -6.2,
    avgHoldTime: '23.1m'
  }
]

const aiFeatures = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Neural Network Analysis',
    description: 'Deep learning algorithms analyze market patterns and sentiment',
    accuracy: 97,
    color: 'neon-orange',
    details: 'Multi-layer LSTM networks with 10M+ parameters'
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Multi-DEX Monitoring',
    description: 'Real-time surveillance across 15+ Solana DEXs',
    coverage: 15,
    color: 'neon-blue',
    details: 'Sub-second latency monitoring across all major pools'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Risk Management',
    description: 'Advanced position sizing and stop-loss mechanisms',
    protection: 99.2,
    color: 'neon-green',
    details: 'Dynamic hedging with real-time risk assessment'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Execution',
    description: 'Sub-second trade execution with MEV protection',
    speed: 0.3,
    color: 'nuclear-glow',
    details: 'Direct RPC connections with priority fee optimization'
  }
]

// Risk Management Dashboard Component
function RiskManagementDashboard() {
  const [riskLevel, setRiskLevel] = useState([3])
  const [maxDrawdown, setMaxDrawdown] = useState([5])
  const [positionSize, setPositionSize] = useState([10])

  return (
    <Card className="glassmorphism border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center text-red-400">
          <Shield className="w-5 h-5 mr-2" />
          Risk Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Level Radar Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={riskMetrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Risk Score"
                dataKey="value"
                stroke="#ff6b35"
                fill="#ff6b35"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold">Risk Level: {riskLevel[0]}/10</Label>
            <Slider
              value={riskLevel}
              onValueChange={setRiskLevel}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Higher = More aggressive trading
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Max Drawdown: {maxDrawdown[0]}%</Label>
            <Slider
              value={maxDrawdown}
              onValueChange={setMaxDrawdown}
              max={20}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Maximum portfolio loss allowed
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Position Size: {positionSize[0]}%</Label>
            <Slider
              value={positionSize}
              onValueChange={setPositionSize}
              max={50}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Maximum position per trade
            </div>
          </div>
        </div>

        {/* Risk Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'VaR (95%)', value: '$234', color: 'red-400' },
            { label: 'Sharpe Ratio', value: '2.14', color: 'neon-green' },
            { label: 'Beta', value: '0.87', color: 'neon-blue' },
            { label: 'Alpha', value: '12.4%', color: 'neon-orange' }
          ].map((metric) => (
            <div key={metric.label} className="text-center p-3 rounded-lg bg-background/50">
              <div className={`text-lg font-bold text-${metric.color}`}>{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Advanced Analytics Dashboard
function AdvancedAnalytics() {
  return (
    <div className="space-y-6">
      {/* Performance Attribution */}
      <Card className="glassmorphism border-neon-blue/30">
        <CardHeader>
          <CardTitle className="flex items-center text-neon-blue">
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance Attribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis yAxisId="left" stroke="#888" />
                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid #00d9ff',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="pnl"
                  fill="#00d9ff"
                  fillOpacity={0.3}
                  stroke="#00d9ff"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sharpeRatio"
                  stroke="#39ff14"
                  strokeWidth={2}
                  dot={{ fill: '#39ff14', strokeWidth: 2, r: 3 }}
                />
                <Bar yAxisId="right" dataKey="riskScore" fill="#ff6b35" fillOpacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Return', value: '847.3%', color: 'neon-green' },
              { label: 'Annualized', value: '234.7%', color: 'neon-blue' },
              { label: 'Volatility', value: '18.4%', color: 'neon-orange' },
              { label: 'Max DD', value: '-6.2%', color: 'red-400' },
              { label: 'Calmar Ratio', value: '12.8', color: 'nuclear-glow' }
            ].map((metric) => (
              <div key={metric.label} className="text-center p-3 rounded-lg bg-background/50">
                <div className={`text-lg font-bold text-${metric.color}`}>{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Performance Breakdown */}
      <Card className="glassmorphism border-nuclear-glow/30">
        <CardHeader>
          <CardTitle className="flex items-center text-nuclear-glow">
            <Target className="w-5 h-5 mr-2" />
            Strategy Performance Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategies}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="sharpeRatio" fill="#ff9500" name="Sharpe Ratio" />
                  <Bar dataKey="allocation" fill="#00d9ff" name="Allocation %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {strategies.map((strategy, index) => (
                <motion.div
                  key={strategy.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg glassmorphism border border-nuclear-glow/20"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">{strategy.name}</span>
                    <Badge className={`bg-${strategy.color}/20 text-${strategy.color} border-${strategy.color}/30 text-xs`}>
                      {strategy.allocation}% allocation
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className={`font-bold text-${strategy.color}`}>{strategy.sharpeRatio}</div>
                      <div className="text-muted-foreground">Sharpe</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-400">{strategy.maxDrawdown}%</div>
                      <div className="text-muted-foreground">Max DD</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{strategy.avgHoldTime}</div>
                      <div className="text-muted-foreground">Avg Hold</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${strategy.risk === 'Low' ? 'text-neon-green' : strategy.risk === 'Medium' ? 'text-neon-orange' : 'text-red-400'}`}>
                        {strategy.risk}
                      </div>
                      <div className="text-muted-foreground">Risk</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Live Trading Terminal
function LiveTradingTerminal() {
  const [terminalLines, setTerminalLines] = useState([
    '[12:34:56] HYDRA-01 INITIALIZED - Neural networks online',
    '[12:34:57] Scanning 15 DEXs for arbitrage opportunities...',
    '[12:35:02] ARBITRAGE DETECTED: RAY/USDC 0.23% spread on Raydium vs Orca',
    '[12:35:03] EXECUTING: Buy 10,000 RAY @ $2.3421 on Orca',
    '[12:35:04] EXECUTING: Sell 10,000 RAY @ $2.3475 on Raydium',
    '[12:35:05] PROFIT: +$54.00 (0.23% return) | Gas: $0.12',
    '[12:35:08] Risk assessment: LOW | Position size: 2.3% of portfolio'
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const newLines = [
        `[${timestamp}] Monitoring market conditions...`,
        `[${timestamp}] ML model confidence: ${(85 + Math.random() * 15).toFixed(1)}%`,
        `[${timestamp}] Portfolio balance: ${(47239 + Math.random() * 1000).toFixed(2)}`,
        `[${timestamp}] Active strategies: ${strategies.filter(s => s.status === 'active').length}/4`
      ]

      setTerminalLines(prev => [...prev.slice(-10), newLines[Math.floor(Math.random() * newLines.length)]])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="glassmorphism border-green-500/30 bg-black/50">
      <CardHeader>
        <CardTitle className="flex items-center text-green-400 font-mono">
          <Binary className="w-5 h-5 mr-2" />
          Live Trading Terminal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          <AnimatePresence>
            {terminalLines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-400 mb-1"
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            className="inline-block w-2 h-4 bg-green-400 ml-1"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function HydraBotSection() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [botEnabled, setBotEnabled] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { unlockAchievement } = useGamification()

  const { signals, loading: signalsLoading } = useRealTimeSignals()
  const { performance, loading: performanceLoading } = useRealTimeBotPerformance()

  // Unlock achievement when user explores bot section
  React.useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        unlockAchievement('hydra-explorer')
      }, 8000)
    }
  }, [isInView, unlockAchievement])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRefreshing(false)
  }

  return (
    <section id="hydra-bot" className="py-20 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-blue/5" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-7xl mx-auto">

          {/* Enhanced Section Header */}
          <StaggerContainer className="text-center mb-16">
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                className="inline-flex items-center space-x-2 mb-4"
              >
                <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30 px-4 py-1">
                  <Bot className="w-4 h-4 mr-2" />
                  Hydra AI Bot
                </Badge>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.h2
                className="text-4xl md:text-6xl lg:text-7xl font-pixel text-glow mb-6 leading-tight"
                animate={{
                  textShadow: [
                    "0 0 20px #00d9ff",
                    "0 0 40px #00d9ff",
                    "0 0 20px #00d9ff"
                  ]
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <span className="text-neon-blue">AI TRADING</span><br />
                <span className="text-foreground">REVOLUTION</span>
              </motion.h2>
            </StaggerItem>

            <StaggerItem>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                The most advanced AI trading system on Solana. Multiple strategies,
                real-time execution, and consistent profits for the community.
              </p>
            </StaggerItem>
          </StaggerContainer>

          {/* Enhanced Bot Status */}
          <StaggerItem className="mb-12">
            <Card className="glassmorphism border-neon-green/30 bg-neon-green/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center"
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(57, 255, 20, 0.5)",
                            "0 0 40px rgba(57, 255, 20, 0.8)",
                            "0 0 20px rgba(57, 255, 20, 0.5)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Bot className="w-6 h-6 text-neon-green" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-neon-green"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-neon-green">HYDRA-01 Status</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Wifi className="w-4 h-4 text-neon-green" />
                        <span>Connected to 15 DEXs</span>
                        <span>•</span>
                        <span>Neural networks active</span>
                        <span>•</span>
                        <span>Last update: 2s ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-green">
                        {performance ? `${performance.winRate.toFixed(1)}%` : '94.7%'}
                      </div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-nuclear-glow">
                        ${performance ? performance.dailyPnL.toLocaleString() : '2,341'}
                      </div>
                      <div className="text-sm text-muted-foreground">Daily P&L</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-blue">
                        2.14
                      </div>
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={botEnabled}
                        onCheckedChange={setBotEnabled}
                        className="data-[state=checked]:bg-neon-green"
                      />
                      <span className="text-sm font-medium">
                        {botEnabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Enhanced Main Bot Interface */}
          <StaggerItem>
            <Card className="glassmorphism border-neon-blue/30 mb-16">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-neon-blue">Advanced Trading Command Center</h3>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="border-neon-blue text-neon-blue hover:bg-neon-blue/10"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-nuclear-glow text-nuclear-glow hover:bg-nuclear-glow/10"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
                    <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="signals" className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Signals</span>
                    </TabsTrigger>
                    <TabsTrigger value="strategies" className="flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Strategies</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger value="risk" className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Risk</span>
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="flex items-center space-x-2">
                      <Binary className="w-4 h-4" />
                      <span>Terminal</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Dashboard Tab */}
                  <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-neon-orange mb-4">Performance Today</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="time" stroke="#888" />
                              <YAxis stroke="#888" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  border: '1px solid #ff9500',
                                  borderRadius: '8px'
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="pnl"
                                stroke="#00d9ff"
                                strokeWidth={3}
                                dot={{ fill: '#00d9ff', strokeWidth: 2, r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-neon-orange mb-4">Live Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Total Trades', value: performance?.totalTrades || 127, color: 'neon-blue', icon: <Activity className="w-4 h-4" /> },
                            { label: 'Active Positions', value: performance?.activePositions || 8, color: 'neon-green', icon: <Target className="w-4 h-4" /> },
                            { label: 'Success Rate', value: `${performance?.winRate.toFixed(1) || 94.7}%`, color: 'nuclear-glow', icon: <CheckCircle className="w-4 h-4" /> },
                            { label: 'Total P&L', value: `$${performance?.totalPnL.toLocaleString() || '47,239'}`, color: 'neon-orange', icon: <DollarSign className="w-4 h-4" /> }
                          ].map((metric, index) => (
                            <motion.div
                              key={metric.label}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 rounded-lg glassmorphism border border-neon-blue/20 text-center"
                            >
                              <div className={`text-${metric.color} mb-2 flex justify-center`}>
                                {metric.icon}
                              </div>
                              <div className={`text-lg font-bold text-${metric.color}`}>
                                {typeof metric.value === 'string' && metric.value.includes('$')
                                  ? metric.value
                                  : <AnimatedCounter from={0} to={Number.parseInt(metric.value.toString().replace(/[^0-9]/g, '')) || 0} />
                                }
                              </div>
                              <div className="text-sm text-muted-foreground">{metric.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Live Signals Tab */}
                  <TabsContent value="signals" className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-neon-green">Live Trading Signals</h4>
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                        <Activity className="w-3 h-3 mr-1" />
                        {signals?.length || 5} Active
                      </Badge>
                    </div>

                    {signalsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={`signal-skeleton-${i}`} className="animate-pulse">
                            <div className="h-20 bg-muted/20 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                          {(signals || []).map((signal, index) => (
                            <motion.div
                              key={signal.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="flex items-center justify-between p-4 rounded-lg glassmorphism border border-neon-green/20 hover:border-neon-green/40 transition-all"
                            >
                              <div className="flex items-center space-x-4">
                                <motion.div
                                  className={`w-3 h-3 rounded-full ${
                                    signal.action === 'BUY' ? 'bg-neon-green' :
                                    signal.action === 'SELL' ? 'bg-flame' :
                                    'bg-neon-orange'
                                  }`}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                />
                                <div>
                                  <div className="font-semibold">{signal.token}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {signal.action} • {signal.confidence}% confidence • {signal.reason}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{signal.price}</div>
                                <div className="text-sm text-neon-green">
                                  +{signal.expectedReturn.toFixed(1)}% expected
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </TabsContent>

                  {/* Enhanced Strategies Tab */}
                  <TabsContent value="strategies" className="space-y-6">
                    <h4 className="text-lg font-semibold text-nuclear-glow mb-4">Active Trading Strategies</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {strategies.map((strategy, index) => (
                        <motion.div
                          key={strategy.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ScaleOnHover>
                            <Card className={`glassmorphism border-${strategy.color}/30 hover-glow h-full`}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`${
                                      strategy.status === 'active'
                                        ? 'bg-neon-green/20 text-neon-green border-neon-green/30'
                                        : 'bg-muted/20 text-muted-foreground border-muted/30'
                                    }`}>
                                      {strategy.status === 'active' ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                                      {strategy.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{strategy.description}</p>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex justify-between">
                                    <span>Performance</span>
                                    <span className={`font-semibold text-${strategy.color}`}>
                                      {strategy.performance}%
                                    </span>
                                  </div>
                                  <Progress value={strategy.performance} className="h-2" />

                                  <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                      <div className="text-sm text-muted-foreground">Trades</div>
                                      <div className="font-semibold">{strategy.trades}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">P&L</div>
                                      <div className={`font-semibold text-${strategy.color}`}>
                                        ${strategy.pnl.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Sharpe</div>
                                      <div className="font-semibold">{strategy.sharpeRatio}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-muted-foreground">Risk</div>
                                      <div className={`font-semibold ${
                                        strategy.risk === 'Low' ? 'text-neon-green' :
                                        strategy.risk === 'Medium' ? 'text-neon-orange' : 'text-red-400'
                                      }`}>
                                        {strategy.risk}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </ScaleOnHover>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Advanced Analytics Tab */}
                  <TabsContent value="analytics" className="space-y-6">
                    <AdvancedAnalytics />
                  </TabsContent>

                  {/* Risk Management Tab */}
                  <TabsContent value="risk" className="space-y-6">
                    <RiskManagementDashboard />
                  </TabsContent>

                  {/* Live Terminal Tab */}
                  <TabsContent value="terminal" className="space-y-6">
                    <LiveTradingTerminal />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Enhanced AI Features Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, index) => (
              <StaggerItem key={feature.title}>
                <ScaleOnHover>
                  <Card className={`glassmorphism border-${feature.color}/30 hover-glow h-full`}>
                    <CardContent className="p-6">
                      <motion.div
                        className={`text-${feature.color} mb-4`}
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                      <div className="mb-3">
                        <div className={`text-lg font-bold text-${feature.color}`}>
                          {feature.accuracy && `${feature.accuracy}% accuracy`}
                          {feature.coverage && `${feature.coverage} DEXs`}
                          {feature.protection && `${feature.protection}% protected`}
                          {feature.speed && `${feature.speed}s avg speed`}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {feature.details}
                      </div>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
