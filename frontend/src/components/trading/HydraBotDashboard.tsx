'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Bell,
  Wifi,
  WifiOff,
  Crown,
  Flame,
  Sparkles,
  Timer,
  Eye,
  Brain,
  Rocket,
  ShieldCheck
} from 'lucide-react'
import { useHydraBot } from '@/hooks/useHydraBot'
import { useWallet } from '@solana/wallet-adapter-react'

interface SignalCardProps {
  signal: any
  onExecute: (token: string, action: string, amount: number) => void
}

function SignalCard({ signal, onExecute }: SignalCardProps) {
  const [tradeAmount, setTradeAmount] = useState(25)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-neon-green border-neon-green/30 bg-neon-green/10'
    if (confidence >= 75) return 'text-neon-blue border-neon-blue/30 bg-neon-blue/10'
    if (confidence >= 60) return 'text-neon-orange border-neon-orange/30 bg-neon-orange/10'
    return 'text-red-400 border-red-400/30 bg-red-400/10'
  }

  const getActionColor = (action: string) => {
    if (action === 'BUY') return 'text-neon-green bg-neon-green/20 border-neon-green/30'
    if (action === 'SELL') return 'text-red-400 bg-red-400/20 border-red-400/30'
    return 'text-neon-orange bg-neon-orange/20 border-neon-orange/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism border-nuclear-glow/30 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg text-nuclear-glow">{signal.token}</h4>
          <p className="text-sm text-muted-foreground">{signal.reasoning}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getActionColor(signal.action)}>
            {signal.action}
          </Badge>
          <Badge className={getConfidenceColor(signal.confidence)}>
            {signal.confidence}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-muted-foreground">Price</div>
          <div className="font-semibold">${signal.price.toFixed(6)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Expected Profit</div>
          <div className="font-semibold text-neon-green">+{signal.expectedProfit}%</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Risk Level</div>
          <div className={`font-semibold ${
            signal.riskLevel === 'LOW' ? 'text-neon-green' :
            signal.riskLevel === 'MEDIUM' ? 'text-neon-orange' : 'text-red-400'
          }`}>
            {signal.riskLevel}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Liquidity</div>
          <div className="font-semibold">{signal.liquidityScore}/100</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <Label className="text-xs">Amount ($)</Label>
          <Input
            type="number"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(Number(e.target.value))}
            className="h-8"
            min="1"
            max="1000"
          />
        </div>
        <Button
          onClick={() => onExecute(signal.token, signal.action, tradeAmount)}
          className="bg-nuclear-gradient hover-glow h-8 px-6"
        >
          Execute
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Signal generated {new Date(signal.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  )
}

export function HydraBotDashboard() {
  const { connected } = useWallet()
  const {
    authenticate,
    isAuthenticated,
    isConnected,
    config,
    updateBotConfig,
    startBot,
    stopBot,
    portfolio,
    signals,
    trades,
    stats,
    executeTrade,
    riskAlerts,
    acknowledgeAlert,
    isLoading,
    error,
    setError
  } = useHydraBot()

  const [activeTab, setActiveTab] = useState('dashboard')

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (connected && !isAuthenticated) {
      authenticate().catch(console.error)
    }
  }, [connected, isAuthenticated, authenticate])

  if (!connected) {
    return (
      <Card className="glassmorphism border-nuclear-glow/30">
        <CardContent className="p-8 text-center">
          <Bot className="w-16 h-16 text-nuclear-glow mx-auto mb-4" />
          <h3 className="text-xl font-bold text-nuclear-glow mb-2">
            Connect Wallet to Access Hydra Bot
          </h3>
          <p className="text-muted-foreground">
            Connect your Solana wallet to start using the most advanced trading bot in 2025
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="glassmorphism border-nuclear-glow/30">
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Bot className="w-full h-full text-nuclear-glow" />
          </motion.div>
          <h3 className="text-xl font-bold text-nuclear-glow mb-2">
            Authenticating Hydra Bot...
          </h3>
          <p className="text-muted-foreground">
            Please sign the authentication message in your wallet
          </p>
          {isLoading && (
            <div className="mt-4">
              <Progress value={66} className="h-2" />
            </div>
          )}
          {error && (
            <Alert className="mt-4 border-red-400/30 bg-red-400/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status & Alerts */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-neon-green" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-sm font-semibold ${
              isConnected ? 'text-neon-green' : 'text-red-400'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {stats && (
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-nuclear-glow" />
              <span className="text-sm text-nuclear-glow">
                {stats.tradesExecuted} trades today
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {riskAlerts.filter(alert => !alert.acknowledged).length > 0 && (
            <Badge className="bg-red-400/20 text-red-400 border-red-400/30">
              <Bell className="w-3 h-3 mr-1" />
              {riskAlerts.filter(alert => !alert.acknowledged).length} alerts
            </Badge>
          )}

          <Button
            onClick={config.isActive ? stopBot : startBot}
            className={`${
              config.isActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-nuclear-gradient hover-glow'
            }`}
            disabled={isLoading}
          >
            {config.isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Bot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Risk Alerts */}
      <AnimatePresence>
        {riskAlerts.filter(alert => !alert.acknowledged).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className={`border-${
              alert.severity === 'CRITICAL' ? 'red-500' :
              alert.severity === 'HIGH' ? 'orange-500' :
              alert.severity === 'MEDIUM' ? 'yellow-500' : 'blue-500'
            }/30 bg-${
              alert.severity === 'CRITICAL' ? 'red-500' :
              alert.severity === 'HIGH' ? 'orange-500' :
              alert.severity === 'MEDIUM' ? 'yellow-500' : 'blue-500'
            }/10`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="ml-4"
                >
                  Acknowledge
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Dashboard */}
      <Card className="glassmorphism border-nuclear-glow/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-nuclear-glow">
            <Bot className="w-6 h-6" />
            <span>Hydra Bot Control Center</span>
            {config.isActive && (
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                <Zap className="w-3 h-3 mr-1" />
                ACTIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="signals">Signals</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <DashboardOverview
                portfolio={portfolio}
                stats={stats}
                config={config}
              />
            </TabsContent>

            {/* Signals Tab */}
            <TabsContent value="signals" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Trading Signals</h3>
                <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30">
                  {signals.length} active signals
                </Badge>
              </div>

              {signals.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    AI is analyzing the market... Signals will appear here
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {signals.map((signal) => (
                    <SignalCard
                      key={signal.id}
                      signal={signal}
                      onExecute={executeTrade}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio">
              <PortfolioView portfolio={portfolio} />
            </TabsContent>

            {/* Trades Tab */}
            <TabsContent value="trades">
              <TradesHistory trades={trades} />
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config">
              <BotConfiguration
                config={config}
                updateConfig={updateBotConfig}
                isLoading={isLoading}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <AnalyticsView portfolio={portfolio} stats={stats} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview({ portfolio, stats, config }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glassmorphism border-neon-green/30">
        <CardContent className="p-6 text-center">
          <DollarSign className="w-8 h-8 text-neon-green mx-auto mb-2" />
          <div className="text-2xl font-bold text-neon-green">
            ${portfolio?.totalValue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-muted-foreground">Total Portfolio</div>
        </CardContent>
      </Card>

      <Card className="glassmorphism border-neon-blue/30">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-neon-blue mx-auto mb-2" />
          <div className="text-2xl font-bold text-neon-blue">
            {stats?.successRate?.toFixed(1) || '0'}%
          </div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </CardContent>
      </Card>

      <Card className="glassmorphism border-neon-orange/30">
        <CardContent className="p-6 text-center">
          <Target className="w-8 h-8 text-neon-orange mx-auto mb-2" />
          <div className="text-2xl font-bold text-neon-orange">
            {stats?.tradesExecuted || 0}
          </div>
          <div className="text-sm text-muted-foreground">Trades Today</div>
        </CardContent>
      </Card>

      <Card className="glassmorphism border-nuclear-glow/30">
        <CardContent className="p-6 text-center">
          <Flame className="w-8 h-8 text-nuclear-glow mx-auto mb-2" />
          <div className="text-2xl font-bold text-nuclear-glow">
            ${stats?.dailyPnL?.toFixed(2) || '0.00'}
          </div>
          <div className="text-sm text-muted-foreground">Daily P&L</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Portfolio View Component
function PortfolioView({ portfolio }: any) {
  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Loading portfolio data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {portfolio.positions?.map((position: any, index: number) => (
        <motion.div
          key={position.token}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glassmorphism border-nuclear-glow/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg">{position.symbol}</h4>
              <p className="text-sm text-muted-foreground">
                {position.amount} tokens
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">${position.value.toFixed(2)}</div>
              <div className={`text-sm ${
                position.pnl >= 0 ? 'text-neon-green' : 'text-red-400'
              }`}>
                {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Trades History Component
function TradesHistory({ trades }: any) {
  return (
    <div className="space-y-3">
      {trades?.slice(0, 20).map((trade: any, index: number) => (
        <motion.div
          key={trade.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glassmorphism border-nuclear-glow/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge className={`${
                trade.type === 'BUY'
                  ? 'bg-neon-green/20 text-neon-green border-neon-green/30'
                  : 'bg-red-400/20 text-red-400 border-red-400/30'
              }`}>
                {trade.type}
              </Badge>
              <div>
                <div className="font-semibold">{trade.token}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${trade.value.toFixed(2)}</div>
              {trade.pnl !== undefined && (
                <div className={`text-sm ${
                  trade.pnl >= 0 ? 'text-neon-green' : 'text-red-400'
                }`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Bot Configuration Component
function BotConfiguration({ config, updateConfig, isLoading }: any) {
  const [localConfig, setLocalConfig] = useState(config)

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...localConfig, [key]: value }
    setLocalConfig(newConfig)
  }

  const saveConfig = async () => {
    await updateConfig(localConfig)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Auto Sniper</Label>
            <Switch
              checked={localConfig.autoSniper}
              onCheckedChange={(checked) => handleConfigChange('autoSniper', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto Re-entry</Label>
            <Switch
              checked={localConfig.autoReentry}
              onCheckedChange={(checked) => handleConfigChange('autoReentry', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Telegram Notifications</Label>
            <Switch
              checked={localConfig.telegramNotifications}
              onCheckedChange={(checked) => handleConfigChange('telegramNotifications', checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Risk Level</Label>
            <div className="flex space-x-2 mt-2">
              {['conservative', 'moderate', 'aggressive'].map((level) => (
                <Button
                  key={level}
                  variant={localConfig.riskLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConfigChange('riskLevel', level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Max Trade Amount: ${localConfig.maxTradeAmount}</Label>
            <Slider
              value={[localConfig.maxTradeAmount]}
              onValueChange={([value]) => handleConfigChange('maxTradeAmount', value)}
              max={1000}
              min={10}
              step={10}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Stop Loss: {localConfig.stopLossPercentage}%</Label>
            <Slider
              value={[localConfig.stopLossPercentage]}
              onValueChange={([value]) => handleConfigChange('stopLossPercentage', value)}
              max={50}
              min={5}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={saveConfig}
        className="bg-nuclear-gradient hover-glow"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Settings className="w-4 h-4 mr-2" />
            Save Configuration
          </>
        )}
      </Button>
    </div>
  )
}

// Analytics View Component
function AnalyticsView({ portfolio, stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="glassmorphism border-nuclear-glow/30">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Total Trades</span>
            <span className="font-semibold">{stats?.tradesExecuted || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Win Rate</span>
            <span className="font-semibold text-neon-green">
              {stats?.successRate?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Profit</span>
            <span className="font-semibold text-nuclear-glow">
              ${stats?.totalProfit?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Daily P&L</span>
            <span className={`font-semibold ${
              (stats?.dailyPnL || 0) >= 0 ? 'text-neon-green' : 'text-red-400'
            }`}>
              ${stats?.dailyPnL?.toFixed(2) || '0.00'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="glassmorphism border-nuclear-glow/30">
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Risk Score</span>
            <span className="font-semibold">{stats?.riskScore || 0}/100</span>
          </div>
          <div className="flex justify-between">
            <span>Max Drawdown</span>
            <span className="font-semibold text-red-400">
              {portfolio?.performance?.maxDrawdown?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sharpe Ratio</span>
            <span className="font-semibold">
              {portfolio?.performance?.sharpeRatio?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Profit Factor</span>
            <span className="font-semibold text-neon-green">
              {portfolio?.performance?.profitFactor?.toFixed(2) || '0.00'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
