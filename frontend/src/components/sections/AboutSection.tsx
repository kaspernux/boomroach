'use client'

import React from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Bot,
  Users,
  Zap,
  Target,
  TrendingUp,
  Rocket,
  Award,
  Lock,
  CheckCircle,
  Globe,
  Flame,
  Heart,
  Star,
  Activity,
  BarChart3,
  Cpu,
  Eye,
  Brain,
  Coins,
  Crown,
  Timer
} from 'lucide-react'
import { StaggerContainer, StaggerItem, ScaleOnHover, ParallaxElement, AnimatedCounter } from '@/components/animations/MobileAnimations'
import { useGamification } from '@/components/gamification/AchievementSystem'

interface FeatureCard {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  stats: {
    value: string
    label: string
    subtext?: string
  }
  features: string[]
  interactiveDemo?: React.ReactNode
}

const features: FeatureCard[] = [
  {
    title: 'Nuclear Resistant',
    description: 'Built to withstand any market crash, rug pull, or crypto winter. The roach that survives everything.',
    icon: <Shield className="w-8 h-8" />,
    color: 'neon-orange',
    stats: {
      value: '100%',
      label: 'Survival Rate',
      subtext: 'Through all market conditions'
    },
    features: [
      'Liquidity locked for 2+ years',
      'Mint authority permanently revoked',
      'Multi-sig treasury protection',
      'Rug-proof smart contract design',
      'Community-owned governance',
      'Transparent operations'
    ],
    interactiveDemo: <SecurityDemo />
  },
  {
    title: 'AI-Powered Trading',
    description: 'Hydra Bot uses advanced AI to snipe profitable trades and automatically support token price.',
    icon: <Bot className="w-8 h-8" />,
    color: 'nuclear-glow',
    stats: {
      value: '94.7%',
      label: 'Win Rate',
      subtext: 'Across 1,247 trades'
    },
    features: [
      'Real-time market analysis',
      'Automated arbitrage trading',
      'Multi-DEX monitoring',
      'Risk management systems',
      'Revenue sharing with holders',
      'Continuous learning AI'
    ],
    interactiveDemo: <TradingDemo />
  },
  {
    title: 'Community Owned',
    description: '100% community-driven with DAO governance. No dev tax, no VC control. Pure democracy.',
    icon: <Users className="w-8 h-8" />,
    color: 'neon-blue',
    stats: {
      value: '24.7K',
      label: 'Members',
      subtext: 'Growing daily'
    },
    features: [
      'Democratic voting system',
      'Community treasury management',
      'Transparent governance',
      'Member reward programs',
      'Open-source development',
      'Global community'
    ],
    interactiveDemo: <CommunityDemo />
  }
]

// Interactive demo components
function SecurityDemo() {
  return (
    <div className="space-y-2">
      {[
        { label: 'Smart Contract', status: 'Audited', color: 'neon-green' },
        { label: 'Liquidity Pool', status: 'Locked', color: 'neon-blue' },
        { label: 'Mint Authority', status: 'Revoked', color: 'neon-orange' },
        { label: 'Treasury', status: 'Multi-sig', color: 'nuclear-glow' }
      ].map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between text-xs"
        >
          <span>{item.label}</span>
          <Badge className={`bg-${item.color}/20 text-${item.color} border-${item.color}/30 text-xs`}>
            <CheckCircle className="w-2 h-2 mr-1" />
            {item.status}
          </Badge>
        </motion.div>
      ))}
    </div>
  )
}

function TradingDemo() {
  const [trades, setTrades] = React.useState(247)
  const [winRate, setWinRate] = React.useState(94.7)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTrades(prev => prev + Math.floor(Math.random() * 3))
      setWinRate(prev => Math.min(99.9, prev + (Math.random() - 0.5) * 0.1))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center p-2 rounded bg-nuclear-glow/10">
          <div className="font-bold text-nuclear-glow">{trades}</div>
          <div>Trades Today</div>
        </div>
        <div className="text-center p-2 rounded bg-neon-green/10">
          <div className="font-bold text-neon-green">{winRate.toFixed(1)}%</div>
          <div>Win Rate</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Live Performance</span>
          <span className="text-neon-green">Active</span>
        </div>
        <Progress value={winRate} className="h-1" />
      </div>
    </div>
  )
}

function CommunityDemo() {
  const [members, setMembers] = React.useState(24783)
  const [activeVotes, setActiveVotes] = React.useState(3)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMembers(prev => prev + Math.floor(Math.random() * 5))
      if (Math.random() > 0.7) {
        setActiveVotes(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center p-2 rounded bg-neon-blue/10">
          <div className="font-bold text-neon-blue">{members.toLocaleString()}</div>
          <div>Members</div>
        </div>
        <div className="text-center p-2 rounded bg-neon-orange/10">
          <div className="font-bold text-neon-orange">{activeVotes}</div>
          <div>Active Votes</div>
        </div>
      </div>
      <motion.div
        className="text-xs text-center text-neon-green"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        🔴 Live DAO Activity
      </motion.div>
    </div>
  )
}

const milestones = [
  {
    title: 'Genesis Launch',
    description: 'Fair launch on Pump.fun with zero presale',
    date: 'Q4 2024',
    completed: true,
    icon: <Rocket className="w-5 h-5" />,
    achievement: 'genesis-survivor'
  },
  {
    title: 'Hydra Bot Alpha',
    description: 'AI trading bot goes live with first signals',
    date: 'Q1 2025',
    completed: true,
    icon: <Bot className="w-5 h-5" />,
    achievement: 'early-adopter'
  },
  {
    title: 'DAO Governance',
    description: 'Community voting system activated',
    date: 'Q2 2025',
    completed: true,
    icon: <Users className="w-5 h-5" />,
    achievement: 'dao-pioneer'
  },
  {
    title: 'CEX Listings',
    description: 'Major centralized exchange listings',
    date: 'Q2 2025',
    completed: false,
    icon: <Globe className="w-5 h-5" />,
    achievement: 'cex-veteran'
  },
  {
    title: 'Global Domination',
    description: 'Top 100 cryptocurrency by market cap',
    date: 'Q3 2025',
    completed: false,
    icon: <Crown className="w-5 h-5" />,
    achievement: 'world-champion'
  }
]

const stats = [
  { value: '12,483', label: 'Holders', change: '+127 today', color: 'neon-blue', icon: <Users className="w-4 h-4" /> },
  { value: '$4.2M', label: 'Market Cap', change: '+15.3% (24h)', color: 'nuclear-glow', icon: <BarChart3 className="w-4 h-4" /> },
  { value: '247', label: 'Trades Today', change: 'Via Hydra Bot', color: 'neon-green', icon: <Activity className="w-4 h-4" /> },
  { value: '100%', label: 'Uptime', change: 'Since launch', color: 'neon-orange', icon: <Timer className="w-4 h-4" /> }
]

export function AboutSection() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -50])
  const { unlockAchievement } = useGamification()

  // Unlock achievement when user scrolls to about section
  React.useEffect(() => {
    if (isInView) {
      // Give user time to read before unlocking achievement
      setTimeout(() => {
        unlockAchievement('about-explorer')
      }, 3000)
    }
  }, [isInView, unlockAchievement])

  return (
    <section id="about" className="py-20 relative overflow-hidden" ref={ref}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-orange/5" />
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-30"
      >
        <div className="absolute top-20 left-10 w-32 h-32 opacity-20">
          <img
            src="https://ext.same-assets.com/3224214395/4224792650.png"
            alt="Roach"
            className="w-full h-full object-contain filter hue-rotate-30 animate-float"
          />
        </div>
        <div className="absolute bottom-20 right-20 w-40 h-40 opacity-15">
          <img
            src="https://ext.same-assets.com/3224214395/842254662.png"
            alt="Roach"
            className="w-full h-full object-contain filter hue-rotate-60 animate-float"
            style={{ animationDelay: '1s' }}
          />
        </div>
      </motion.div>

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
                <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30 px-4 py-1">
                  <Flame className="w-4 h-4 mr-2" />
                  About $BOOMROACH
                </Badge>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.h2
                className="text-4xl md:text-6xl lg:text-7xl font-pixel text-glow mb-6 leading-tight"
                animate={{
                  textShadow: [
                    "0 0 20px #ff9500",
                    "0 0 40px #ff9500",
                    "0 0 20px #ff9500"
                  ]
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <span className="text-neon-orange">THE UNKILLABLE</span><br />
                <span className="text-foreground">MEME COIN</span>
              </motion.h2>
            </StaggerItem>

            <StaggerItem>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Born from chaos, powered by AI, and multiplied by an unstoppable community.
                The roach that refuses to die and evolves to dominate.
              </p>
            </StaggerItem>
          </StaggerContainer>

          {/* Enhanced Live Stats Grid */}
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <ScaleOnHover>
                  <Card className="glassmorphism border-neon-orange/30 text-center hover-glow group">
                    <CardContent className="p-6">
                      <motion.div
                        className={`text-${stat.color} mb-3 flex justify-center group-hover:scale-110 transition-transform`}
                      >
                        {stat.icon}
                      </motion.div>
                      <motion.div
                        className={`text-2xl md:text-3xl font-bold text-${stat.color} mb-2`}
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: index * 0.2, type: 'spring', damping: 15 }}
                      >
                        {stat.value.includes('$') ? (
                          stat.value
                        ) : (
                          <AnimatedCounter
                            from={0}
                            to={Number.parseInt(stat.value.replace(/[^0-9]/g, '')) || 0}
                            suffix={stat.value.includes('%') ? '%' : ''}
                          />
                        )}
                      </motion.div>
                      <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-xs text-neon-green">{stat.change}</div>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Enhanced Interactive Features Showcase */}
          <StaggerItem className="mb-16">
            <Tabs defaultValue="security" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Trading</span>
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Community</span>
                </TabsTrigger>
              </TabsList>

              {features.map((feature, index) => (
                <TabsContent key={index} value={index === 0 ? 'security' : index === 1 ? 'ai' : 'community'}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className={`glassmorphism border-${feature.color}/30 overflow-hidden`}>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                          {/* Content */}
                          <div>
                            <div className="flex items-center space-x-4 mb-6">
                              <div className={`p-4 rounded-xl bg-${feature.color}/20 text-${feature.color}`}>
                                {feature.icon}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                              </div>
                            </div>

                            {/* Feature Stats */}
                            <div className="mb-6 p-4 rounded-lg bg-background/50">
                              <div className={`text-3xl font-bold text-${feature.color} mb-1`}>
                                {feature.stats.value}
                              </div>
                              <div className="text-sm text-muted-foreground mb-1">
                                {feature.stats.label}
                              </div>
                              {feature.stats.subtext && (
                                <div className="text-xs text-muted-foreground">
                                  {feature.stats.subtext}
                                </div>
                              )}
                            </div>

                            {/* Feature List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {feature.features.map((item, itemIndex) => (
                                <motion.div
                                  key={itemIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: itemIndex * 0.1 }}
                                  className="flex items-center space-x-2 text-sm"
                                >
                                  <CheckCircle className={`w-4 h-4 text-${feature.color} flex-shrink-0`} />
                                  <span>{item}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Interactive Demo */}
                          <div className="lg:pl-8">
                            <div className="p-6 rounded-xl glassmorphism border border-neon-orange/20">
                              <h4 className="font-semibold mb-4 text-neon-orange">Live Demo</h4>
                              {feature.interactiveDemo}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </StaggerItem>

          {/* Enhanced Timeline */}
          <StaggerContainer className="mb-16">
            <StaggerItem>
              <h3 className="text-3xl font-pixel text-nuclear-glow mb-8 text-center">Evolution Timeline</h3>
            </StaggerItem>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-neon-green via-neon-orange to-nuclear-glow opacity-50" />

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <StaggerItem key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                      transition={{ delay: index * 0.2 }}
                      className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      {/* Content */}
                      <div className="w-5/12">
                        <ScaleOnHover>
                          <Card className={`glassmorphism ${milestone.completed ? 'border-neon-green/30' : 'border-muted/30'} hover-glow`}>
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className={`p-2 rounded-lg ${milestone.completed ? 'bg-neon-green/20 text-neon-green' : 'bg-muted/20 text-muted-foreground'}`}>
                                  {milestone.completed ? <CheckCircle className="w-4 h-4" /> : milestone.icon}
                                </div>
                                <div>
                                  <div className={`font-semibold ${milestone.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {milestone.title}
                                  </div>
                                  <Badge className={`text-xs ${milestone.completed ? 'bg-neon-green/20 text-neon-green border-neon-green/30' : 'bg-muted/20 text-muted-foreground border-muted/30'}`}>
                                    {milestone.date}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            </CardContent>
                          </Card>
                        </ScaleOnHover>
                      </div>

                      {/* Timeline Node */}
                      <div className="w-2/12 flex justify-center">
                        <motion.div
                          className={`w-12 h-12 rounded-full border-4 ${milestone.completed ? 'border-neon-green bg-neon-green/20' : 'border-muted bg-muted/20'} flex items-center justify-center relative z-10`}
                          whileHover={{ scale: 1.2 }}
                          animate={milestone.completed ? {
                            boxShadow: [
                              "0 0 20px rgba(57, 255, 20, 0.5)",
                              "0 0 40px rgba(57, 255, 20, 0.8)",
                              "0 0 20px rgba(57, 255, 20, 0.5)"
                            ]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: milestone.completed ? Number.POSITIVE_INFINITY : 0
                          }}
                        >
                          <div className={milestone.completed ? 'text-neon-green' : 'text-muted-foreground'}>
                            {milestone.completed ? <CheckCircle className="w-5 h-5" /> : milestone.icon}
                          </div>
                        </motion.div>
                      </div>

                      {/* Spacer */}
                      <div className="w-5/12" />
                    </motion.div>
                  </StaggerItem>
                ))}
              </div>
            </div>
          </StaggerContainer>

          {/* Enhanced Call to Action */}
          <StaggerItem className="text-center">
            <Card className="glassmorphism border-nuclear-glow/30 bg-nuclear-gradient/10 max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-8 relative">
                {/* Animated background elements */}
                <motion.div
                  className="absolute inset-0 opacity-10"
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 20%, #ff9500 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 80%, #39ff14 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 20%, #ff9500 0%, transparent 50%)"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                />

                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-pixel text-nuclear-glow mb-4">
                    Join the Unkillable Army
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Be part of the revolution. Whether you're here for the memes, the technology,
                    or the profits—the roach army welcomes all survivors.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="nuclear-gradient hover-glow group">
                        <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                        Buy $BOOMROACH
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="outline" className="border-neon-blue text-neon-blue hover:bg-neon-blue/10 group">
                        <Heart className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                        Join Community
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="outline" className="border-nuclear-glow text-nuclear-glow hover:bg-nuclear-glow/10 group">
                        <Star className="w-5 h-5 mr-2 group-hover:animate-spin" />
                        Learn More
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </div>
    </section>
  )
}
