'use client'

import React from 'react'
import { TradingInterface } from '@/components/trading/TradingInterface'
import { ResponsiveNavbar } from '@/components/ResponsiveNavbar'
import { useRealTimeData } from '@/hooks/useRealTimeData'
import { useABTestContext } from '@/components/abtest/ABTestProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  Users,
  Bot,
  Zap,
  ArrowLeft,
  BarChart3,
  Globe,
  Flame
} from 'lucide-react'

export default function TradePage() {
  const { data: realTimeData, isConnected } = useRealTimeData()
  const { getVariant, trackConversion } = useABTestContext()

  // Track page visit for A/B testing
  React.useEffect(() => {
    trackConversion('trading_page_visit', 'page_view')
  }, [trackConversion])

  const marketSummary = Object.values(realTimeData.prices).reduce(
    (acc, price) => ({
      totalVolume: acc.totalVolume + price.volume24h,
      avgChange: acc.avgChange + price.change24h,
      count: acc.count + 1
    }),
    { totalVolume: 0, avgChange: 0, count: 0 }
  )

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <ResponsiveNavbar />

        <main className="container mx-auto px-4 py-8 mt-20">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="mb-4 text-neon-orange hover:bg-neon-orange/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <h1 className="text-4xl md:text-5xl font-pixel text-neon-orange mb-2">
                  HYDRA TRADING
                </h1>
                <p className="text-xl text-muted-foreground">
                  Advanced AI-powered trading platform with real-time market data
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${isConnected ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-red-400/20 text-red-400 border-red-400/30'}`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {isConnected ? 'Live' : 'Offline'}
                </Badge>
              </div>
            </motion.div>

            {/* Real-time Market Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glassmorphism border-nuclear-glow/30 bg-nuclear-glow/5">
                <CardHeader>
                  <CardTitle className="flex items-center text-nuclear-glow">
                    <Globe className="w-5 h-5 mr-2" />
                    Live Market Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-nuclear-glow">
                        ${(marketSummary.totalVolume / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-muted-foreground">24h Volume</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${marketSummary.count > 0 && marketSummary.avgChange / marketSummary.count >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                        {marketSummary.count > 0 ?
                          `${(marketSummary.avgChange / marketSummary.count >= 0 ? '+' : '')}${(marketSummary.avgChange / marketSummary.count).toFixed(2)}%`
                          : 'Loading...'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Change</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-blue">
                        {realTimeData.community.onlineUsers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Online Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-orange">
                        {realTimeData.trading.aiSignalsAccuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">AI Accuracy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="glassmorphism border-neon-green/30">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-neon-green mx-auto mb-4" />
                  <div className="text-2xl font-bold text-neon-green mb-2">
                    {realTimeData.community.totalHolders.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Holders</div>
                  <Badge className="mt-2 bg-neon-green/20 text-neon-green border-neon-green/30">
                    {realTimeData.community.socialSentiment}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glassmorphism border-neon-blue/30">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-neon-blue mx-auto mb-4" />
                  <div className="text-2xl font-bold text-neon-blue mb-2">
                    {realTimeData.trading.successfulTrades.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful Trades</div>
                  <Badge className="mt-2 bg-neon-blue/20 text-neon-blue border-neon-blue/30">
                    24h Active
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glassmorphism border-neon-orange/30">
                <CardContent className="p-6 text-center">
                  <Bot className="w-12 h-12 text-neon-orange mx-auto mb-4" />
                  <div className="text-2xl font-bold text-neon-orange mb-2">
                    ${realTimeData.trading.avgProfitPerTrade.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Profit/Trade</div>
                  <Badge className="mt-2 bg-neon-orange/20 text-neon-orange border-neon-orange/30">
                    AI Powered
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Trading Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TradingInterface />
            </motion.div>

            {/* Top Traders Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glassmorphism border-nuclear-glow/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-nuclear-glow">
                    <Flame className="w-5 h-5 mr-2" />
                    Top Traders (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {realTimeData.trading.topTraders.map((trader, index) => (
                      <div
                        key={trader.address}
                        className="flex items-center justify-between p-4 rounded-lg glassmorphism border border-nuclear-glow/20"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-nuclear-glow/20 text-nuclear-glow' :
                            index === 1 ? 'bg-neon-orange/20 text-neon-orange' :
                            'bg-neon-blue/20 text-neon-blue'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-mono font-semibold">{trader.address}</div>
                            <div className="text-sm text-muted-foreground">
                              Win Rate: {trader.winRate.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-neon-green">
                            +${trader.profit24h.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">24h Profit</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* A/B Test Variant Display (for testing purposes) */}
            {process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glassmorphism border-yellow-400/30 bg-yellow-400/5">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">A/B Test Status (Dev Only)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Hero CTA:</strong> {getVariant('hero_cta_optimization')}
                      </div>
                      <div>
                        <strong>Achievement Position:</strong> {getVariant('achievement_notification_position')}
                      </div>
                      <div>
                        <strong>Community Layout:</strong> {getVariant('community_section_layout')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
