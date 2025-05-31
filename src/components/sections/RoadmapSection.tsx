'use client'

import React, { useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle,
  Clock,
  Target,
  Rocket,
  Bot,
  Users,
  Globe,
  Zap,
  Star,
  Trophy,
  Crown,
  Flame,
  Shield,
  TrendingUp,
  Lock,
  Award,
  RefreshCw,
  ArrowRight,
  Calendar,
  Activity,
  Vote,
  MessageCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  PieChart,
  GitBranch,
  Flag,
  Bookmark
} from 'lucide-react'
import { StaggerContainer, StaggerItem, ScaleOnHover, AnimatedCounter } from '@/components/animations/MobileAnimations'
import { useGamification } from '@/components/gamification/AchievementSystem'

interface RoadmapPhase {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'upcoming'
  progress: number
  quarter: string
  year: string
  color: string
  icon: React.ReactNode
  milestones: {
    title: string
    description: string
    completed: boolean
    important: boolean
    votes?: number
    discussionCount?: number
  }[]
  deliverables: string[]
  impact: {
    community: number
    technology: number
    value: number
  }
  communityVotes: {
    priority: number
    excitement: number
    confidence: number
  }
  achievement?: string
  estimatedCompletion?: string
  timeline?: {
    milestone: string
    date: string
    completed: boolean
  }[]
  infestationPlan?: {
    metric: string
    value: string
    icon: React.ReactNode
  }[]
}

const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'genesis',
    title: 'Genesis - Containment Breach',
    description: 'The birth of the unkillable roach. Fair launch and community building.',
    status: 'completed',
    progress: 100,
    quarter: 'Q4',
    year: '2024',
    color: 'neon-green',
    icon: <Rocket className="w-6 h-6" />,
    milestones: [
      { title: 'Fair Launch on Pump.fun', description: 'Zero presale, community-first approach', completed: true, important: true, votes: 247, discussionCount: 18 },
      { title: 'Smart Contract Deployment', description: 'Audited and secure token contract', completed: true, important: true, votes: 198, discussionCount: 12 },
      { title: 'Initial Community Building', description: 'Discord and Telegram launch', completed: true, important: false, votes: 156, discussionCount: 24 },
      { title: 'Website & Branding Launch', description: 'Professional presence established', completed: true, important: false, votes: 203, discussionCount: 31 },
      { title: 'First 1000 Holders', description: 'Early adopters join the army', completed: true, important: true, votes: 289, discussionCount: 45 }
    ],
    deliverables: [
      'Token Contract (Audited)',
      'Community Platforms',
      'Brand Identity',
      'Initial Marketing Campaign'
    ],
    impact: {
      community: 100,
      technology: 85,
      value: 90
    },
    communityVotes: {
      priority: 95,
      excitement: 92,
      confidence: 96
    },
    achievement: 'genesis-survivor',
    estimatedCompletion: 'Completed',
    timeline: [
      { milestone: 'Token Launch', date: 'Dec 15, 2024', completed: true },
      { milestone: 'Community Setup', date: 'Dec 18, 2024', completed: true },
      { milestone: 'First Exchange', date: 'Dec 22, 2024', completed: true },
      { milestone: '1K Holders', date: 'Dec 28, 2024', completed: true }
    ],
    infestationPlan: [
      { metric: 'Launch Success', value: '100%', icon: <Rocket className="w-3 h-3" /> },
      { metric: 'Community Growth', value: '247%', icon: <Users className="w-3 h-3" /> },
      { metric: 'Security Rating', value: 'A+', icon: <Shield className="w-3 h-3" /> },
      { metric: 'Market Position', value: '#1', icon: <Crown className="w-3 h-3" /> }
    ]
  },
  {
    id: 'evolution',
    title: 'Evolution - Mutation Begins',
    description: 'Advanced features rollout including AI bot and DAO governance.',
    status: 'in-progress',
    progress: 85,
    quarter: 'Q1',
    year: '2025',
    color: 'neon-blue',
    icon: <Bot className="w-6 h-6" />,
    milestones: [
      { title: 'Hydra Bot Alpha Launch', description: 'AI trading bot goes live', completed: true, important: true, votes: 312, discussionCount: 67 },
      { title: 'DAO Governance System', description: 'Community voting implemented', completed: true, important: true, votes: 278, discussionCount: 89 },
      { title: 'Staking Platform', description: 'Earn rewards for holding', completed: false, important: true, votes: 245, discussionCount: 34 },
      { title: 'NFT Collection Drop', description: 'Roach-themed NFTs', completed: false, important: false, votes: 189, discussionCount: 23 },
      { title: 'Mobile App Beta', description: 'Trading on the go', completed: false, important: true, votes: 234, discussionCount: 12 }
    ],
    deliverables: [
      'AI Trading System',
      'DAO Platform',
      'Staking Rewards',
      'Mobile Application'
    ],
    impact: {
      community: 85,
      technology: 95,
      value: 80
    },
    communityVotes: {
      priority: 88,
      excitement: 91,
      confidence: 87
    },
    achievement: 'evolution-pioneer',
    estimatedCompletion: 'March 2025',
    timeline: [
      { milestone: 'Hydra Bot Alpha', date: 'Jan 15, 2025', completed: true },
      { milestone: 'DAO Launch', date: 'Jan 30, 2025', completed: true },
      { milestone: 'Staking Platform', date: 'Feb 15, 2025', completed: false },
      { milestone: 'Mobile App Beta', date: 'Mar 1, 2025', completed: false }
    ],
    infestationPlan: [
      { metric: 'AI Win Rate', value: '94.7%', icon: <Bot className="w-3 h-3" /> },
      { metric: 'DAO Participation', value: '78%', icon: <Vote className="w-3 h-3" /> },
      { metric: 'Tech Innovation', value: '95%', icon: <Zap className="w-3 h-3" /> },
      { metric: 'User Growth', value: '+150%', icon: <TrendingUp className="w-3 h-3" /> }
    ]
  },
  {
    id: 'domination',
    title: 'Domination - Exchange Expansion',
    description: 'Major exchange listings and ecosystem partnerships.',
    status: 'upcoming',
    progress: 25,
    quarter: 'Q2',
    year: '2025',
    color: 'neon-orange',
    icon: <Globe className="w-6 h-6" />,
    milestones: [
      { title: 'Tier 1 CEX Listings', description: 'Binance, Coinbase, OKX', completed: false, important: true, votes: 456, discussionCount: 123 },
      { title: 'Cross-Chain Bridge', description: 'Ethereum and BSC expansion', completed: false, important: true, votes: 378, discussionCount: 87 },
      { title: 'DeFi Integrations', description: 'Major protocol partnerships', completed: false, important: true, votes: 298, discussionCount: 56 },
      { title: 'Institutional Partnerships', description: 'Strategic alliances', completed: false, important: false, votes: 234, discussionCount: 34 },
      { title: 'Global Marketing Campaign', description: 'Worldwide brand recognition', completed: false, important: true, votes: 345, discussionCount: 78 }
    ],
    deliverables: [
      'CEX Listings',
      'Cross-Chain Support',
      'DeFi Partnerships',
      'Marketing Campaigns'
    ],
    impact: {
      community: 90,
      technology: 85,
      value: 95
    },
    communityVotes: {
      priority: 94,
      excitement: 97,
      confidence: 82
    },
    achievement: 'domination-architect',
    estimatedCompletion: 'June 2025',
    timeline: [
      { milestone: 'CEX Applications', date: 'Apr 1, 2025', completed: false },
      { milestone: 'Cross-Chain Dev', date: 'Apr 15, 2025', completed: false },
      { milestone: 'First CEX Listing', date: 'May 1, 2025', completed: false },
      { milestone: 'Global Marketing', date: 'Jun 1, 2025', completed: false }
    ],
    infestationPlan: [
      { metric: 'Exchange Reach', value: '5M+', icon: <Globe className="w-3 h-3" /> },
      { metric: 'Market Cap Target', value: '$100M', icon: <Target className="w-3 h-3" /> },
      { metric: 'Global Presence', value: '50 Countries', icon: <Activity className="w-3 h-3" /> },
      { metric: 'Liquidity Growth', value: '+500%', icon: <TrendingUp className="w-3 h-3" /> }
    ]
  },
  {
    id: 'immortality',
    title: 'Immortality - Global Infestation',
    description: 'Complete ecosystem maturity and self-sustaining growth.',
    status: 'upcoming',
    progress: 0,
    quarter: 'Q3-Q4',
    year: '2025',
    color: 'nuclear-glow',
    icon: <Crown className="w-6 h-6" />,
    milestones: [
      { title: 'Roach GameFi Platform', description: 'Play-to-earn ecosystem', completed: false, important: true, votes: 389, discussionCount: 145 },
      { title: 'AI Bot Marketplace', description: 'Community-created strategies', completed: false, important: true, votes: 312, discussionCount: 98 },
      { title: 'Real-World Integration', description: 'Physical world utilities', completed: false, important: false, votes: 267, discussionCount: 67 },
      { title: 'Autonomous DAO', description: 'Fully self-governing', completed: false, important: true, votes: 298, discussionCount: 89 },
      { title: 'Global Recognition', description: 'Top 100 cryptocurrency', completed: false, important: true, votes: 445, discussionCount: 156 }
    ],
    deliverables: [
      'GameFi Platform',
      'AI Marketplace',
      'Real-World Use Cases',
      'Autonomous Governance'
    ],
    impact: {
      community: 100,
      technology: 100,
      value: 100
    },
    communityVotes: {
      priority: 92,
      excitement: 98,
      confidence: 78
    },
    achievement: 'immortality-legend',
    estimatedCompletion: 'Q4 2025',
    timeline: [
      { milestone: 'GameFi Development', date: 'Jul 1, 2025', completed: false },
      { milestone: 'AI Marketplace Beta', date: 'Aug 15, 2025', completed: false },
      { milestone: 'Autonomous DAO', date: 'Sep 30, 2025', completed: false },
      { milestone: 'Global Recognition', date: 'Dec 31, 2025', completed: false }
    ],
    infestationPlan: [
      { metric: 'Ecosystem Maturity', value: '∞', icon: <Crown className="w-3 h-3" /> },
      { metric: 'Self-Sustaining', value: '100%', icon: <Shield className="w-3 h-3" /> },
      { metric: 'Global Adoption', value: '1B+', icon: <Globe className="w-3 h-3" /> },
      { metric: 'Immortality Status', value: 'ACHIEVED', icon: <Star className="w-3 h-3" /> }
    ]
  }
]

const upcomingEvents = [
  {
    id: 'staking-launch',
    date: '2025-02-15',
    title: 'Staking Platform Launch',
    description: 'Earn rewards for holding $BOOMROACH',
    type: 'feature',
    importance: 'high',
    votes: { for: 234, against: 12 },
    status: 'confirmed'
  },
  {
    id: 'mobile-beta',
    date: '2025-03-01',
    title: 'Mobile App Beta Release',
    description: 'iOS and Android trading app',
    type: 'product',
    importance: 'medium',
    votes: { for: 189, against: 23 },
    status: 'voting'
  },
  {
    id: 'cex-listing',
    date: '2025-03-15',
    title: 'First CEX Listing Announcement',
    description: 'Major exchange partnership reveal',
    type: 'business',
    importance: 'high',
    votes: { for: 456, against: 34 },
    status: 'confirmed'
  },
  {
    id: 'cross-chain',
    date: '2025-04-01',
    title: 'Cross-Chain Bridge Launch',
    description: 'Ethereum and BSC expansion',
    type: 'technology',
    importance: 'high',
    votes: { for: 298, against: 18 },
    status: 'development'
  }
]

// Community Voting Component
function CommunityVoting({ milestone, onVote }: {
  milestone: { title: string; votes?: number; discussionCount?: number }
  onVote: (type: 'priority' | 'comment') => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  return (
    <Card className="glassmorphism border-neon-blue/30 mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm">{milestone.title}</h4>
          <div className="flex items-center space-x-2">
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
              <Vote className="w-3 h-3 mr-1" />
              {milestone.votes || 0} votes
            </Badge>
            <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30 text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              {milestone.discussionCount || 0}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <Button
            size="sm"
            onClick={() => onVote('priority')}
            className="bg-neon-green/20 text-neon-green hover:bg-neon-green/30 border border-neon-green/30"
          >
            <ThumbsUp className="w-3 h-3 mr-1" />
            Priority Vote
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowComments(!showComments)}
            className="border-neon-blue text-neon-blue hover:bg-neon-blue/10"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Discuss
          </Button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 border-t border-border/50 pt-3"
            >
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Recent Comments:</div>
                <div className="space-y-2">
                  {['Great feature! Can\'t wait for this.', 'What about security considerations?', 'Timeline seems realistic 👍'].map((comment, index) => (
                    <div key={`comment-${index}`} className="text-xs p-2 rounded bg-background/50">
                      <span className="font-mono text-neon-orange">User{index + 1}:</span> {comment}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Add your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-xs"
                  tabIndex={-1}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    onVote('comment')
                    setNewComment('')
                  }}
                  className="bg-neon-orange/20 text-neon-orange hover:bg-neon-orange/30"
                >
                  Post
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export function RoadmapSection() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [showEvents, setShowEvents] = useState(false)
  const [votingData, setVotingData] = useState<Record<string, number>>({})
  const { unlockAchievement } = useGamification()

  // Unlock achievement when user explores roadmap
  React.useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        unlockAchievement('roadmap-explorer')
      }, 6000)
    }
  }, [isInView, unlockAchievement])

  const handleVote = (milestoneId: string, type: 'priority' | 'comment') => {
    setVotingData(prev => ({
      ...prev,
      [milestoneId]: (prev[milestoneId] || 0) + 1
    }))

    if (type === 'priority') {
      unlockAchievement('community-voter')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-neon-green" />
      case 'in-progress':
        return <RefreshCw className="w-5 h-5 text-neon-blue animate-spin" />
      case 'upcoming':
        return <Clock className="w-5 h-5 text-neon-orange" />
      default:
        return <Target className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Zap className="w-4 h-4" />
      case 'product': return <Star className="w-4 h-4" />
      case 'business': return <TrendingUp className="w-4 h-4" />
      case 'technology': return <Bot className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <section id="roadmap" className="py-20 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-orange/5" />

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
                  <Target className="w-4 h-4 mr-2" />
                  Roadmap 2025
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
                <span className="text-neon-orange">THE INFESTATION</span><br />
                <span className="text-foreground">PLAN</span>
              </motion.h2>
            </StaggerItem>

            <StaggerItem>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                From fair launch to global domination. The strategic evolution of the
                unkillable roach across four legendary phases. Vote on priorities and track our progress.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex justify-center space-x-4 mt-8">
                <Button
                  variant={showEvents ? "default" : "outline"}
                  onClick={() => setShowEvents(!showEvents)}
                  className="border-nuclear-glow text-nuclear-glow hover:bg-nuclear-glow/10"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {showEvents ? 'Hide' : 'Show'} Upcoming Events
                </Button>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Enhanced Upcoming Events Timeline */}
          {showEvents && (
            <StaggerItem className="mb-16">
              <Card className="glassmorphism border-nuclear-glow/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-nuclear-glow">
                    <Calendar className="w-5 h-5 mr-2" />
                    Community-Voted Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-lg glassmorphism border ${
                          event.importance === 'high' ? 'border-neon-orange/30' : 'border-muted/30'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            event.importance === 'high' ? 'bg-neon-orange/20 text-neon-orange' : 'bg-muted/20 text-muted-foreground'
                          }`}>
                            {getTypeIcon(event.type)}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center space-x-2">
                              <span>{event.title}</span>
                              {event.status === 'confirmed' && <CheckCircle className="w-4 h-4 text-neon-green" />}
                              {event.status === 'voting' && <Vote className="w-4 h-4 text-neon-blue" />}
                              {event.status === 'development' && <RefreshCw className="w-4 h-4 text-neon-orange" />}
                            </div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {event.votes.for} votes
                              </Badge>
                              {event.votes.against > 0 && (
                                <Badge className="bg-red-400/20 text-red-400 border-red-400/30 text-xs">
                                  <ThumbsDown className="w-3 h-3 mr-1" />
                                  {event.votes.against}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm">{new Date(event.date).toLocaleDateString()}</div>
                          <Badge className={`text-xs ${
                            event.importance === 'high'
                              ? 'bg-neon-orange/20 text-neon-orange border-neon-orange/30'
                              : 'bg-muted/20 text-muted-foreground border-muted/30'
                          }`}>
                            {event.importance} priority
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )}

          {/* Enhanced Main Roadmap Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-neon-green via-neon-blue via-neon-orange to-nuclear-glow opacity-50" />

            <div className="space-y-20">
              {roadmapPhases.map((phase, index) => (
                <StaggerItem key={phase.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ delay: index * 0.3 }}
                    className="relative"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Content */}
                      <div className={`lg:col-span-5 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-3'}`}>
                        <ScaleOnHover>
                          <Card
                            className={`glassmorphism border-${phase.color}/30 hover-glow cursor-pointer transition-all duration-300 h-full ${
                              selectedPhase === phase.id ? 'ring-2 ring-neon-orange/50' : ''
                            }`}
                            onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-lg bg-${phase.color}/20 text-${phase.color}`}>
                                    {phase.icon}
                                  </div>
                                  <div>
                                    <CardTitle className="text-xl">{phase.title}</CardTitle>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <span>{phase.quarter} {phase.year}</span>
                                      <span>•</span>
                                      {getStatusIcon(phase.status)}
                                      <span className="capitalize">{phase.status.replace('-', ' ')}</span>
                                    </div>
                                  </div>
                                </div>
                                <Badge className={`bg-${phase.color}/20 text-${phase.color} border-${phase.color}/30`}>
                                  {phase.progress}%
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4">{phase.description}</p>

                              <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{phase.progress}%</span>
                                </div>
                                <Progress value={phase.progress} className="h-2" />
                              </div>

                              {/* Enhanced Impact Metrics */}
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-neon-blue">
                                    <AnimatedCounter from={0} to={phase.impact.community} suffix="%" />
                                  </div>
                                  <div className="text-xs text-muted-foreground">Community</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-nuclear-glow">
                                    <AnimatedCounter from={0} to={phase.impact.technology} suffix="%" />
                                  </div>
                                  <div className="text-xs text-muted-foreground">Technology</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-neon-green">
                                    <AnimatedCounter from={0} to={phase.impact.value} suffix="%" />
                                  </div>
                                  <div className="text-xs text-muted-foreground">Value</div>
                                </div>
                              </div>

                              {/* Expandable Details */}
                              {selectedPhase === phase.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-4 border-t border-border/50 pt-4"
                                >
                                  {/* Enhanced Milestones with Voting */}
                                  <div>
                                    <h4 className="font-semibold mb-3 text-neon-orange flex items-center">
                                      <Flag className="w-4 h-4 mr-2" />
                                      Key Milestones
                                    </h4>
                                    <div className="space-y-3">
                                      {phase.milestones.map((milestone, i) => (
                                        <div key={`milestone-${phase.id}-${i}`} className="space-y-2">
                                          <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-2 flex-1">
                                              {milestone.completed ? (
                                                <CheckCircle className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                                              ) : (
                                                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                              )}
                                              <div className="flex-1">
                                                <div className={`text-sm font-medium flex items-center space-x-2 ${milestone.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                  <span>{milestone.title}</span>
                                                  {milestone.important && <Star className="w-3 h-3 text-nuclear-glow" />}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{milestone.description}</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-2">
                                              <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30 text-xs">
                                                <Vote className="w-2 h-2 mr-1" />
                                                {milestone.votes || 0}
                                              </Badge>
                                              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                                                <MessageCircle className="w-2 h-2 mr-1" />
                                                {milestone.discussionCount || 0}
                                              </Badge>
                                            </div>
                                          </div>

                                          {!milestone.completed && (
                                            <CommunityVoting
                                              milestone={milestone}
                                              onVote={(type) => handleVote(`${phase.id}-${i}`, type)}
                                            />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Deliverables */}
                                  <div>
                                    <h4 className="font-semibold mb-2 text-neon-blue flex items-center">
                                      <Bookmark className="w-4 h-4 mr-2" />
                                      Deliverables
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {phase.deliverables.map((deliverable, i) => (
                                        <Badge key={`deliverable-${i}`} variant="outline" className="text-xs border-neon-blue/30">
                                          {deliverable}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </ScaleOnHover>
                      </div>

                      {/* Timeline Node (Center) */}
                      <div className="lg:col-span-2 lg:order-2 flex justify-center">
                        <motion.div
                          className={`w-16 h-16 rounded-full border-4 border-${phase.color} bg-background flex items-center justify-center relative z-10`}
                          animate={{
                            boxShadow: phase.status === 'in-progress' ? [
                              `0 0 20px hsl(var(--${phase.color}) / 0.5)`,
                              `0 0 40px hsl(var(--${phase.color}) / 0.8)`,
                              `0 0 20px hsl(var(--${phase.color}) / 0.5)`
                            ] : `0 0 10px hsl(var(--${phase.color}) / 0.3)`
                          }}
                          transition={{
                            duration: 2,
                            repeat: phase.status === 'in-progress' ? Number.POSITIVE_INFINITY : 0
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className={`text-${phase.color}`}>
                            {getStatusIcon(phase.status)}
                          </div>
                        </motion.div>
                      </div>

                      {/* Right Content (Evolution Timeline & Infestation Plan) */}
                      <div className={`lg:col-span-5 ${index % 2 === 0 ? 'lg:order-3' : 'lg:order-1'} space-y-4`}>
                        {/* Evolution Timeline Card */}
                        <Card className="glassmorphism border-neon-blue/30 h-full">
                          <CardHeader>
                            <CardTitle className="flex items-center text-neon-blue text-sm">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Evolution Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              {(phase.timeline || [
                                { milestone: 'Phase Planning', date: 'In Progress', completed: phase.status === 'completed' },
                                { milestone: 'Development Start', date: phase.estimatedCompletion || 'TBD', completed: false },
                                { milestone: 'Community Review', date: 'Pending', completed: false },
                                { milestone: 'Launch Ready', date: 'Future', completed: false }
                              ]).map((item, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-neon-green' : 'bg-neon-blue/50'}`} />
                                  <div className="flex-1">
                                    <div className={`text-sm font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {item.milestone}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{item.date}</div>
                                  </div>
                                  {item.completed && <CheckCircle className="w-4 h-4 text-neon-green" />}
                                </div>
                              ))}
                            </div>

                            <div className="pt-3 border-t border-border/50">
                              <div className="text-xs text-muted-foreground mb-2">Community Sentiment:</div>
                              <div className="space-y-2">
                                {[
                                  { label: 'Priority', value: phase.communityVotes?.priority || 75, color: 'neon-orange' },
                                  { label: 'Excitement', value: phase.communityVotes?.excitement || 85, color: 'neon-green' },
                                  { label: 'Confidence', value: phase.communityVotes?.confidence || 80, color: 'neon-blue' }
                                ].map((metric) => (
                                  <div key={metric.label} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>{metric.label}</span>
                                      <span className={`font-bold text-${metric.color}`}>{metric.value}%</span>
                                    </div>
                                    <Progress value={metric.value} className="h-1" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Infestation Plan Card */}
                        <Card className="glassmorphism border-nuclear-glow/30 bg-nuclear-glow/5">
                          <CardHeader>
                            <CardTitle className="flex items-center text-nuclear-glow text-sm">
                              <Target className="w-4 h-4 mr-2" />
                              Infestation Plan
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              {(phase.infestationPlan || [
                                { metric: 'Spread Rate', value: '247%', icon: <TrendingUp className="w-3 h-3" /> },
                                { metric: 'Resistance', value: '∞', icon: <Shield className="w-3 h-3" /> },
                                { metric: 'Growth', value: '+42%', icon: <Activity className="w-3 h-3" /> },
                                { metric: 'Survival', value: '100%', icon: <Crown className="w-3 h-3" /> }
                              ]).map((metric, i) => (
                                <div key={i} className="text-center p-2 rounded-lg bg-background/30">
                                  <div className="text-nuclear-glow mb-1 flex justify-center">
                                    {metric.icon}
                                  </div>
                                  <div className="text-xs font-bold text-nuclear-glow">{metric.value}</div>
                                  <div className="text-[10px] text-muted-foreground">{metric.metric}</div>
                                </div>
                              ))}
                            </div>

                            <div className="pt-3 border-t border-border/50">
                              <div className="text-xs text-muted-foreground mb-2">Estimated Completion:</div>
                              <div className="font-semibold text-nuclear-glow text-sm">
                                {phase.estimatedCompletion || `${phase.quarter} ${phase.year}`}
                              </div>
                            </div>

                            {/* Achievement Badge */}
                            <div className="flex items-center space-x-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <Trophy className="w-4 h-4 text-purple-400" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-purple-400">Phase Achievement</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {phase.achievement || 'Nuclear Evolution Complete'}
                                </div>
                              </div>
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </div>

          {/* Enhanced Call to Action */}
          <StaggerItem className="text-center mt-16">
            <Card className="glassmorphism border-nuclear-glow/30 bg-nuclear-gradient/10 max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl md:text-3xl font-pixel text-nuclear-glow mb-4">
                  Shape the Future
                </h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Your voice matters. Vote on milestones, discuss priorities, and help guide
                  the evolution of the unkillable roach ecosystem.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="nuclear-gradient hover-glow">
                    <Vote className="w-5 h-5 mr-2" />
                    Vote on Priorities
                  </Button>
                  <Button size="lg" variant="outline" className="border-neon-blue text-neon-blue hover:bg-neon-blue/10">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Join Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </div>
      </div>
    </section>
  )
}
