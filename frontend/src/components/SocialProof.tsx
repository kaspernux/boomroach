'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Shield,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Eye,
  Lock,
  Award,
  Zap,
  Globe,
  Twitter,
  MessageCircle,
  ExternalLink
} from 'lucide-react'

// Testimonial component
interface Testimonial {
  id: string
  name: string
  handle: string
  avatar: string
  content: string
  rating: number
  platform: 'twitter' | 'telegram' | 'discord'
  verified: boolean
  timestamp: Date
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'CryptoWhale2024',
    handle: '@CryptoWhale2024',
    avatar: '/api/placeholder/40/40',
    content: 'BOOMROACH saved my portfolio during the last crash. This roach really is unkillable! 🪳💎',
    rating: 5,
    platform: 'twitter',
    verified: true,
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    name: 'DeFiDegenerate',
    handle: '@DeFiDegen',
    avatar: '/api/placeholder/40/40',
    content: 'Hydra Bot made me 300% gains while I was sleeping. This is the future of trading! 🤖⚡',
    rating: 5,
    platform: 'telegram',
    verified: true,
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: '3',
    name: 'SolanaMaxi',
    handle: '@SolanaMaxi',
    avatar: '/api/placeholder/40/40',
    content: 'Best meme coin community on Solana. The DAO actually works and the team delivers! 🚀',
    rating: 5,
    platform: 'discord',
    verified: false,
    timestamp: new Date(Date.now() - 14400000)
  }
]

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const platformIcons = {
    twitter: <Twitter className="w-4 h-4 text-blue-400" />,
    telegram: <MessageCircle className="w-4 h-4 text-blue-500" />,
    discord: <MessageCircle className="w-4 h-4 text-indigo-500" />
  }

  const timeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor(diff / 60000)

    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="glassmorphism border-neon-blue/30 h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={testimonial.avatar} />
                <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-sm">{testimonial.name}</span>
                  {testimonial.verified && (
                    <CheckCircle className="w-3 h-3 text-neon-blue" />
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {platformIcons[testimonial.platform]}
                  <span>{testimonial.handle}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {timeAgo(testimonial.timestamp)}
            </div>
          </div>

          <p className="text-sm mb-3 leading-relaxed">{testimonial.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <Badge variant="outline" className="text-xs border-neon-green/30 text-neon-green">
              Verified Holder
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Security badges component
export function SecurityBadges() {
  const badges = [
    {
      title: 'Smart Contract Audited',
      description: 'Audited by CertiK',
      icon: <Shield className="w-5 h-5" />,
      color: 'neon-green',
      verified: true,
      link: '#'
    },
    {
      title: 'Liquidity Locked',
      description: '2 years locked',
      icon: <Lock className="w-5 h-5" />,
      color: 'neon-blue',
      verified: true,
      link: '#'
    },
    {
      title: 'Mint Authority Revoked',
      description: 'Cannot mint new tokens',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'neon-orange',
      verified: true,
      link: '#'
    },
    {
      title: 'KYC Verified',
      description: 'Team doxxed & verified',
      icon: <Award className="w-5 h-5" />,
      color: 'purple-400',
      verified: true,
      link: '#'
    }
  ]

  return (
    <Card className="glassmorphism border-neon-green/30">
      <CardHeader>
        <CardTitle className="flex items-center text-neon-green font-pixel">
          <Shield className="w-5 h-5 mr-2" />
          Security & Trust
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg border ${
                badge.verified
                  ? `border-${badge.color}/30 bg-${badge.color}/5`
                  : 'border-gray-500/30 bg-gray-500/5 grayscale'
              } cursor-pointer`}
              onClick={() => window.open(badge.link, '_blank')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`text-${badge.color}`}>
                  {badge.icon}
                </div>
                {badge.verified && (
                  <CheckCircle className={`w-4 h-4 text-${badge.color}`} />
                )}
              </div>
              <h4 className="font-semibold text-sm mb-1">{badge.title}</h4>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Live activity feed
export function LiveActivityFeed() {
  const [activities, setActivities] = React.useState([
    { id: 1, type: 'trade', user: '7xK2...R9mF', action: 'bought 50K $BOOMROACH', time: '2m ago', value: '+$2,100' },
    { id: 2, type: 'vote', user: 'RoAcH...1337', action: 'voted on Proposal #42', time: '5m ago', value: 'FOR' },
    { id: 3, type: 'join', user: 'N3w...R0ach', action: 'joined the army', time: '8m ago', value: '+1 holder' },
    { id: 4, type: 'trade', user: 'Wh4le...B0t', action: 'sold 25K $BOOMROACH', time: '12m ago', value: '-$1,050' }
  ])

  // Simulate new activities
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: ['trade', 'vote', 'join'][Math.floor(Math.random() * 3)],
        user: `${Math.random().toString(36).substr(2, 4).toUpperCase()}...${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        action: 'made a move',
        time: 'now',
        value: `+$${Math.floor(Math.random() * 5000)}`
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 4)])
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4 text-neon-green" />
      case 'vote': return <CheckCircle className="w-4 h-4 text-neon-blue" />
      case 'join': return <Users className="w-4 h-4 text-neon-orange" />
      default: return <Zap className="w-4 h-4 text-nuclear-glow" />
    }
  }

  return (
    <Card className="glassmorphism border-nuclear-glow/30">
      <CardHeader>
        <CardTitle className="flex items-center text-nuclear-glow font-pixel">
          <Eye className="w-5 h-5 mr-2" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <div className="text-sm">
                      <span className="font-mono text-neon-orange">{activity.user}</span>
                      <span className="text-muted-foreground ml-1">{activity.action}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
                <Badge className={`text-xs ${
                  activity.value.startsWith('+') ? 'text-neon-green border-neon-green/30' :
                  activity.value.startsWith('-') ? 'text-red-400 border-red-400/30' :
                  'text-neon-blue border-neon-blue/30'
                }`}>
                  {activity.value}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

// Community metrics
export function CommunityMetrics() {
  const metrics = [
    { label: 'Discord Members', value: '24,783', change: '+127', icon: <MessageCircle className="w-5 h-5" /> },
    { label: 'Telegram Members', value: '31,234', change: '+89', icon: <MessageCircle className="w-5 h-5" /> },
    { label: 'Twitter Followers', value: '47,891', change: '+234', icon: <Twitter className="w-5 h-5" /> },
    { label: 'GitHub Stars', value: '1,247', change: '+12', icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <Card className="glassmorphism border-neon-blue/30">
      <CardHeader>
        <CardTitle className="flex items-center text-neon-blue font-pixel">
          <Users className="w-5 h-5 mr-2" />
          Community Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-3 rounded-lg bg-background/30"
            >
              <div className="flex justify-center mb-2 text-neon-blue">
                {metric.icon}
              </div>
              <div className="text-lg font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
              <div className="text-xs text-neon-green mt-1">{metric.change} today</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Trust score component
export function TrustScore() {
  const trustScore = 94
  const factors = [
    { name: 'Audit Score', score: 98, weight: 30 },
    { name: 'Liquidity Health', score: 95, weight: 25 },
    { name: 'Community Trust', score: 92, weight: 20 },
    { name: 'Team Transparency', score: 89, weight: 15 },
    { name: 'Code Quality', score: 96, weight: 10 }
  ]

  return (
    <Card className="glassmorphism border-neon-green/30">
      <CardHeader>
        <CardTitle className="flex items-center text-neon-green font-pixel">
          <Award className="w-5 h-5 mr-2" />
          Trust Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <motion.div
            className="text-4xl font-bold text-neon-green mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            {trustScore}/100
          </motion.div>
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
            Excellent Trust Rating
          </Badge>
        </div>

        <div className="space-y-3">
          {factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{factor.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-background/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neon-green rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ delay: index * 0.2, duration: 1 }}
                  />
                </div>
                <span className="text-xs text-neon-green w-8">{factor.score}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Main social proof section
export function SocialProofSection() {
  return (
    <div className="space-y-6">
      {/* Trust Score and Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrustScore />
        <SecurityBadges />
      </div>

      {/* Community and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunityMetrics />
        <LiveActivityFeed />
      </div>

      {/* Testimonials */}
      <div>
        <h3 className="font-pixel text-lg text-neon-blue mb-4">What Roaches Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </div>
  )
}
