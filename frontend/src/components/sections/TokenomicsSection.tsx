'use client'

import React, { useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar
} from 'recharts'
import {
  Coins,
  TrendingUp,
  Flame,
  Users,
  Bot,
  Lock,
  DollarSign,
  Target,
  Zap,
  Award,
  Shield,
  RefreshCw,
  Calculator,
  Percent,
  Timer,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Wallet,
  Crown,
  Rocket
} from 'lucide-react'
import { StaggerContainer, StaggerItem, ScaleOnHover, AnimatedCounter } from '@/components/animations/MobileAnimations'
import { useGamification } from '@/components/gamification/AchievementSystem'

// Enhanced tokenomics data
const tokenDistribution = [
  { name: 'Community Treasury', value: 40, color: '#ff9500', amount: '400,000,000', description: 'Community-controlled funds for development and rewards' },
  { name: 'Public Sale', value: 30, color: '#00d9ff', amount: '300,000,000', description: 'Fair launch distribution to early supporters' },
  { name: 'Liquidity Pool', value: 20, color: '#39ff14', amount: '200,000,000', description: 'DEX liquidity and trading pairs' },
  { name: 'Team & Development', value: 10, color: '#ff6b35', amount: '100,000,000', description: 'Team allocation with 2-year vesting' }
]

const utilityBreakdown = [
  { name: 'Hydra Bot Revenue Share', percentage: 45, color: '#ff9500', apy: 24.5 },
  { name: 'DAO Voting Power', percentage: 30, color: '#00d9ff', multiplier: '1.5x' },
  { name: 'Staking Rewards', percentage: 25, color: '#39ff14', apy: 18.2 }
]

const burnData = [
  { week: 'Week 1', burned: 2500000, cumulative: 2500000, price: 0.000038 },
  { week: 'Week 2', burned: 3200000, cumulative: 5700000, price: 0.000041 },
  { week: 'Week 3', burned: 4100000, cumulative: 9800000, price: 0.000045 },
  { week: 'Week 4', burned: 5500000, cumulative: 15300000, price: 0.000052 },
  { week: 'Week 5', burned: 7200000, cumulative: 22500000, price: 0.000058 },
  { week: 'Week 6', burned: 9100000, cumulative: 31600000, price: 0.000067 }
]

const priceProjection = [
  { month: 'Jan', conservative: 0.000045, realistic: 0.000055, bullish: 0.000075, volume: 2500000 },
  { month: 'Feb', conservative: 0.000052, realistic: 0.000068, bullish: 0.000095, volume: 3200000 },
  { month: 'Mar', conservative: 0.000061, realistic: 0.000085, bullish: 0.000125, volume: 4100000 },
  { month: 'Apr', conservative: 0.000075, realistic: 0.000110, bullish: 0.000170, volume: 5800000 },
  { month: 'May', conservative: 0.000089, realistic: 0.000145, bullish: 0.000230, volume: 7200000 },
  { month: 'Jun', conservative: 0.000105, realistic: 0.000190, bullish: 0.000320, volume: 9500000 }
]

const revenueStreams = [
  {
    id: 'hydra-bot',
    title: 'Hydra Bot Trading Fees',
    description: 'AI bot generates revenue through successful trades',
    percentage: 40,
    monthlyRevenue: 47239,
    growth: 23.5,
    color: 'neon-orange',
    apy: 24.5,
    risk: 'Medium'
  },
  {
    id: 'dex-fees',
    title: 'DEX Transaction Fees',
    description: 'Small fee on all $BOOMROACH trades',
    percentage: 25,
    monthlyRevenue: 29500,
    growth: 18.2,
    color: 'neon-blue',
    apy: 12.8,
    risk: 'Low'
  },
  {
    id: 'nft-marketplace',
    title: 'NFT Marketplace',
    description: 'Roach-themed NFT collections and trading',
    percentage: 20,
    monthlyRevenue: 23600,
    growth: 45.7,
    color: 'nuclear-glow',
    apy: 31.2,
    risk: 'High'
  },
  {
    id: 'staking-pools',
    title: 'Staking Pool Fees',
    description: 'Revenue from staking and liquidity provision',
    percentage: 15,
    monthlyRevenue: 17750,
    growth: 12.1,
    color: 'neon-green',
    apy: 18.2,
    risk: 'Low'
  }
]

const tokenMetrics = [
  { label: 'Total Supply', value: '1,000,000,000', suffix: ' $BOOMROACH', color: 'neon-orange', icon: <Coins className="w-4 h-4" /> },
  { label: 'Circulating Supply', value: '968,400,000', suffix: ' $BOOMROACH', color: 'neon-blue', icon: <Activity className="w-4 h-4" /> },
  { label: 'Burned Forever', value: '31,600,000', suffix: ' $BOOMROACH', color: 'flame', icon: <Flame className="w-4 h-4" /> },
  { label: 'Market Cap', value: '4,200,000', prefix: '$', color: 'nuclear-glow', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Holders', value: '12,483', suffix: ' wallets', color: 'neon-green', icon: <Users className="w-4 h-4" /> },
  { label: 'LP Locked', value: '24', suffix: ' months', color: 'purple-400', icon: <Lock className="w-4 h-4" /> }
]

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number | string
    color: string
    dataKey?: string
  }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        className="glassmorphism border border-neon-orange/30 p-3 rounded-lg backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-semibold text-neon-orange">{label}</p>
        {payload.map((entry, index) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </motion.div>
    )
  }
  return null
}

// APY Calculator Component
function APYCalculator() {
  const [stakingAmount, setStakingAmount] = useState(100000)
  const [stakingPeriod, setStakingPeriod] = useState([12])
  const [selectedPool, setSelectedPool] = useState('hydra-bot')

  const pool = revenueStreams.find(s => s.id === selectedPool) || revenueStreams[0]
  const annualReturn = (stakingAmount * pool.apy) / 100
  const monthlyReturn = annualReturn / 12
  const totalReturn = (annualReturn * stakingPeriod[0]) / 12

  return (
    <Card className="glassmorphism border-nuclear-glow/30">
      <CardHeader>
        <CardTitle className="flex items-center text-nuclear-glow">
          <Calculator className="w-5 h-5 mr-2" />
          Yield Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pool Selection */}
        <div>
          <Label className="text-sm font-semibold">Select Pool</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {revenueStreams.map((stream) => (
              <Button
                key={stream.id}
                variant={selectedPool === stream.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPool(stream.id)}
                className={`text-xs ${selectedPool === stream.id ? 'nuclear-gradient' : `border-${stream.color} text-${stream.color} hover:bg-${stream.color}/10`}`}
              >
                {stream.apy}% APY
              </Button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <Label className="text-sm font-semibold">Staking Amount ($BOOMROACH)</Label>
          <Input
            type="number"
            value={stakingAmount}
            onChange={(e) => setStakingAmount(Number(e.target.value))}
            className="mt-1"
            placeholder="Enter amount..."
          />
        </div>

        {/* Period Slider */}
        <div>
          <Label className="text-sm font-semibold">Staking Period: {stakingPeriod[0]} months</Label>
          <Slider
            value={stakingPeriod}
            onValueChange={setStakingPeriod}
            max={24}
            min={1}
            step={1}
            className="mt-2"
          />
        </div>

        {/* Results */}
        <div className="space-y-3 p-4 rounded-lg bg-background/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Monthly Return</div>
              <div className={`text-lg font-bold text-${pool.color}`}>
                ${monthlyReturn.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Return</div>
              <div className={`text-lg font-bold text-${pool.color}`}>
                ${totalReturn.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-sm">Final Amount:</span>
              <span className="text-xl font-bold text-nuclear-glow">
                {(stakingAmount + totalReturn).toLocaleString()} $BOOMROACH
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Staking Interface Component
function StakingInterface() {
  const [activeStakes, setActiveStakes] = useState([
    { id: 1, amount: 50000, pool: 'Hydra Bot', apy: 24.5, timeLeft: 45, rewards: 1250 },
    { id: 2, amount: 25000, pool: 'LP Rewards', apy: 18.2, timeLeft: 23, rewards: 890 }
  ])

  return (
    <Card className="glassmorphism border-neon-green/30">
      <CardHeader>
        <CardTitle className="flex items-center text-neon-green">
          <Crown className="w-5 h-5 mr-2" />
          Active Stakes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeStakes.length > 0 ? (
          <div className="space-y-4">
            {activeStakes.map((stake) => (
              <motion.div
                key={stake.id}
                className="p-4 rounded-lg glassmorphism border border-neon-green/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">{stake.pool} Pool</div>
                    <div className="text-sm text-muted-foreground">{stake.amount.toLocaleString()} $BOOMROACH</div>
                  </div>
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    {stake.apy}% APY
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Rewards Earned</div>
                    <div className="font-semibold text-neon-green">{stake.rewards} $BOOMROACH</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Time Remaining</div>
                    <div className="font-semibold">{stake.timeLeft} days</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1 bg-neon-green/20 text-neon-green hover:bg-neon-green/30">
                    Claim Rewards
                  </Button>
                  <Button size="sm" variant="outline" className="border-neon-orange text-neon-orange hover:bg-neon-orange/10">
                    Unstake
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No active stakes</p>
            <Button className="nuclear-gradient">Start Staking</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TokenomicsSection() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState('distribution')
  const { unlockAchievement } = useGamification()

  // Unlock achievement when user explores tokenomics
  React.useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        unlockAchievement('tokenomics-explorer')
      }, 5000)
    }
  }, [isInView, unlockAchievement])

  return (
    <section id="tokenomics" className="py-20 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-nuclear-glow/5" />

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
                <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30 px-4 py-1">
                  <Coins className="w-4 h-4 mr-2" />
                  Tokenomics
                </Badge>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.h2
                className="text-4xl md:text-6xl lg:text-7xl font-pixel text-glow mb-6 leading-tight"
                animate={{
                  textShadow: [
                    "0 0 20px #ffff00",
                    "0 0 40px #ffff00",
                    "0 0 20px #ffff00"
                  ]
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <span className="text-nuclear-glow">NUCLEAR</span><br />
                <span className="text-foreground">ECONOMICS</span>
              </motion.h2>
            </StaggerItem>

            <StaggerItem>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Deflationary by design, powered by utility, and sustained by community growth.
                The economics of survival and prosperity.
              </p>
            </StaggerItem>
          </StaggerContainer>

          {/* Enhanced Key Metrics Grid */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {tokenMetrics.map((metric) => (
              <StaggerItem key={metric.label}>
                <ScaleOnHover>
                  <Card className="glassmorphism border-neon-orange/30 text-center hover-glow group">
                    <CardContent className="p-4">
                      <motion.div
                        className={`text-${metric.color} mb-2 flex justify-center group-hover:scale-110 transition-transform`}
                      >
                        {metric.icon}
                      </motion.div>
                      <motion.div
                        className={`text-lg md:text-xl font-bold text-${metric.color} mb-1`}
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: Number.parseInt(metric.value.replace(/[^0-9]/g, '')) * 0.0001, type: 'spring', damping: 15 }}
                      >
                        <AnimatedCounter
                          from={0}
                          to={Number.parseInt(metric.value.replace(/,/g, '')) || 0}
                          prefix={metric.prefix || ''}
                          suffix={metric.suffix || ''}
                        />
                      </motion.div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Enhanced Main Tokenomics Dashboard */}
          <StaggerItem>
            <Card className="glassmorphism border-nuclear-glow/30 mb-16">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
                    <TabsTrigger value="distribution" className="flex items-center space-x-2">
                      <PieChartIcon className="w-4 h-4" />
                      <span>Distribution</span>
                    </TabsTrigger>
                    <TabsTrigger value="utility" className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Utility</span>
                    </TabsTrigger>
                    <TabsTrigger value="burns" className="flex items-center space-x-2">
                      <Flame className="w-4 h-4" />
                      <span>Burns</span>
                    </TabsTrigger>
                    <TabsTrigger value="projections" className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Projections</span>
                    </TabsTrigger>
                    <TabsTrigger value="staking" className="flex items-center space-x-2">
                      <Crown className="w-4 h-4" />
                      <span>Staking</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Token Distribution */}
                  <TabsContent value="distribution" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-neon-orange mb-4">Token Allocation</h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={tokenDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {tokenDistribution.map((entry) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-neon-orange mb-4">Allocation Details</h3>
                        {tokenDistribution.map((item) => (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                            transition={{ delay: Number.parseFloat(item.value.toString()) * 0.01 }}
                            className="p-4 rounded-lg glassmorphism border border-neon-orange/20 hover:border-neon-orange/40 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <div>
                                  <div className="font-semibold">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold" style={{ color: item.color }}>
                                  {item.value}%
                                </div>
                                <div className="text-xs text-muted-foreground">{item.amount}</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Enhanced Utility Breakdown */}
                  <TabsContent value="utility" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-nuclear-glow mb-4">Token Utility</h3>
                        {utilityBreakdown.map((utility) => (
                          <motion.div
                            key={utility.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: Number.parseFloat(utility.percentage.toString()) * 0.01 }}
                            className="mb-6 p-4 rounded-lg glassmorphism border border-nuclear-glow/20"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold">{utility.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold" style={{ color: utility.color }}>
                                  {utility.percentage}%
                                </span>
                                {utility.apy && (
                                  <Badge className={`bg-${utility.color}/20 text-${utility.color} border-${utility.color}/30 text-xs`}>
                                    {utility.apy}% APY
                                  </Badge>
                                )}
                                {utility.multiplier && (
                                  <Badge className={`bg-${utility.color}/20 text-${utility.color} border-${utility.color}/30 text-xs`}>
                                    {utility.multiplier}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Progress
                              value={utility.percentage}
                              className="h-3 mb-2"
                            />
                          </motion.div>
                        ))}
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-nuclear-glow mb-4">Revenue Streams</h3>
                        <div className="space-y-4">
                          {revenueStreams.map((stream) => (
                            <motion.div
                              key={stream.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                              transition={{ delay: Number.parseFloat(stream.percentage.toString()) * 0.02 }}
                              className="p-4 rounded-lg glassmorphism border border-nuclear-glow/20 hover:border-nuclear-glow/40 transition-all group"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="font-semibold">{stream.title}</div>
                                  <div className="text-sm text-muted-foreground">{stream.description}</div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className={`text-lg font-bold text-${stream.color}`}>
                                    ${stream.monthlyRevenue.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-neon-green">+{stream.growth}%</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center p-2 rounded bg-background/50">
                                  <div className={`font-bold text-${stream.color}`}>{stream.apy}%</div>
                                  <div className="text-muted-foreground">APY</div>
                                </div>
                                <div className="text-center p-2 rounded bg-background/50">
                                  <div className="font-bold">{stream.percentage}%</div>
                                  <div className="text-muted-foreground">Share</div>
                                </div>
                                <div className="text-center p-2 rounded bg-background/50">
                                  <div className={`font-bold ${stream.risk === 'Low' ? 'text-neon-green' : stream.risk === 'Medium' ? 'text-neon-orange' : 'text-red-400'}`}>
                                    {stream.risk}
                                  </div>
                                  <div className="text-muted-foreground">Risk</div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Enhanced Burn Analytics */}
                  <TabsContent value="burns" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-flame mb-4">Token Burn History & Impact</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="h-80">
                          <h4 className="text-sm font-semibold mb-2">Burn Rate & Price Correlation</h4>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={burnData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="week" stroke="#888" />
                              <YAxis yAxisId="left" stroke="#888" />
                              <YAxis yAxisId="right" orientation="right" stroke="#888" />
                              <Tooltip content={<CustomTooltip />} />
                              <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="burned"
                                stackId="1"
                                stroke="#ff6b35"
                                fill="#ff6b35"
                                fillOpacity={0.3}
                                name="Tokens Burned"
                              />
                              <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                stackId="2"
                                stroke="#39ff14"
                                fill="#39ff14"
                                fillOpacity={0.2}
                                name="Price ($)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold">Burn Mechanics</h4>
                          <div className="space-y-3">
                            {[
                              { mechanism: 'Trading Fees', percentage: 40, description: '0.5% of all trades burned automatically' },
                              { mechanism: 'Bot Profits', percentage: 30, description: '25% of Hydra Bot profits burned weekly' },
                              { mechanism: 'DAO Decisions', percentage: 20, description: 'Community votes on additional burns' },
                              { mechanism: 'Events & Milestones', percentage: 10, description: 'Special burns for achievements' }
                            ].map((item, index) => (
                              <motion.div
                                key={item.mechanism}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 rounded-lg bg-background/50 border border-flame/20"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-sm">{item.mechanism}</span>
                                  <span className="text-flame font-bold">{item.percentage}%</span>
                                </div>
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                                <Progress value={item.percentage} className="h-1 mt-2" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                          { icon: <Flame className="w-8 h-8 text-flame" />, label: 'Total Burned', value: '31.6M', subtext: 'Tokens removed forever' },
                          { icon: <TrendingUp className="w-8 h-8 text-neon-green" />, label: 'Burn Rate', value: '+127%', subtext: 'Weekly growth' },
                          { icon: <RefreshCw className="w-8 h-8 text-neon-orange" />, label: 'Auto Burns', value: 'Daily', subtext: 'Automatic execution' },
                          { icon: <Target className="w-8 h-8 text-neon-blue" />, label: 'Next Burn', value: '2.5M', subtext: 'Tokens scheduled' }
                        ].map((metric, index) => (
                          <Card key={metric.label} className="glassmorphism border-flame/30 text-center">
                            <CardContent className="p-4">
                              <motion.div
                                className="mb-2 flex justify-center"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                              >
                                {metric.icon}
                              </motion.div>
                              <div className="text-xl font-bold">{metric.value}</div>
                              <div className="text-sm text-muted-foreground">{metric.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">{metric.subtext}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Enhanced Price Projections */}
                  <TabsContent value="projections" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-neon-blue mb-4">Price & Volume Projections (2025)</h3>
                      <div className="h-80 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceProjection}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="month" stroke="#888" />
                            <YAxis yAxisId="left" stroke="#888" />
                            <YAxis yAxisId="right" orientation="right" stroke="#888" />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="conservative"
                              stroke="#888"
                              strokeDasharray="5 5"
                              name="Conservative"
                              strokeWidth={2}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="realistic"
                              stroke="#00d9ff"
                              strokeWidth={3}
                              name="Realistic"
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="bullish"
                              stroke="#39ff14"
                              strokeWidth={2}
                              name="Bullish"
                            />
                            <Bar yAxisId="right" dataKey="volume" fill="#ff9500" fillOpacity={0.3} name="Volume" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { scenario: 'Conservative', price: '$0.000105', multiplier: '2.5x', color: 'gray-400' },
                          { scenario: 'Realistic', price: '$0.000190', multiplier: '4.5x', color: 'neon-blue' },
                          { scenario: 'Bullish', price: '$0.000320', multiplier: '7.6x', color: 'neon-green' }
                        ].map((projection, index) => (
                          <motion.div
                            key={projection.scenario}
                            whileHover={{ scale: 1.05 }}
                            className="text-center"
                          >
                            <Card className={`glassmorphism border-${projection.color}/30 hover-glow`}>
                              <CardContent className="p-6">
                                <div className="mb-3">
                                  {index === 0 && <Shield className={`w-8 h-8 text-${projection.color} mx-auto`} />}
                                  {index === 1 && <Target className={`w-8 h-8 text-${projection.color} mx-auto`} />}
                                  {index === 2 && <Rocket className={`w-8 h-8 text-${projection.color} mx-auto`} />}
                                </div>
                                <div className={`text-xl font-bold text-${projection.color} mb-1`}>
                                  {projection.price}
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">{projection.scenario} (Jun)</div>
                                <Badge className={`bg-${projection.color}/20 text-${projection.color} border-${projection.color}/30`}>
                                  {projection.multiplier} from current
                                </Badge>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* New Staking Tab */}
                  <TabsContent value="staking" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <APYCalculator />
                      <StakingInterface />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Enhanced Security Features */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Lock className="w-6 h-6" />, title: 'LP Locked', desc: '24 months', color: 'neon-blue', detail: 'Liquidity permanently secured' },
              { icon: <Shield className="w-6 h-6" />, title: 'Mint Revoked', desc: 'Forever', color: 'neon-green', detail: 'No new tokens can be created' },
              { icon: <Award className="w-6 h-6" />, title: 'Audited', desc: 'CertiK', color: 'neon-orange', detail: 'Smart contract verified' },
              { icon: <Users className="w-6 h-6" />, title: 'Community', desc: '100% Owned', color: 'nuclear-glow', detail: 'Fully decentralized governance' }
            ].map((feature, index) => (
              <StaggerItem key={feature.title}>
                <ScaleOnHover>
                  <Card className={`glassmorphism border-${feature.color}/30 text-center hover-glow group h-full`}>
                    <CardContent className="p-6">
                      <motion.div
                        className={`text-${feature.color} mb-3 flex justify-center group-hover:scale-110 transition-transform`}
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <div className="font-semibold mb-1">{feature.title}</div>
                      <div className={`text-sm text-${feature.color} font-bold mb-2`}>{feature.desc}</div>
                      <div className="text-xs text-muted-foreground">{feature.detail}</div>
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
