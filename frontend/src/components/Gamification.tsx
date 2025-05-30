'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Star,
  Zap,
  Crown,
  Target,
  TrendingUp,
  Users,
  Bot,
  Vote,
  Flame,
  Shield,
  Rocket
} from 'lucide-react'

// Achievement types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: 'wallet' | 'trading' | 'dao' | 'social' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: Date
  reward?: {
    type: 'tokens' | 'nft' | 'badge' | 'access'
    amount?: number
    description: string
  }
}

// Sample achievements data
const sampleAchievements: Achievement[] = [
  {
    id: 'first-connection',
    title: 'Nuclear Roach',
    description: 'Connect your first Solana wallet',
    icon: <Zap className="w-6 h-6" />,
    type: 'wallet',
    rarity: 'common',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: new Date(),
    reward: { type: 'tokens', amount: 100, description: '100 $BOOMROACH tokens' }
  },
  {
    id: 'first-trade',
    title: 'Trader Roach',
    description: 'Execute your first trade through Hydra Bot',
    icon: <Bot className="w-6 h-6" />,
    type: 'trading',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'nft', description: 'Exclusive Trader Roach NFT' }
  },
  {
    id: 'dao-voter',
    title: 'Democracy Roach',
    description: 'Cast your first DAO vote',
    icon: <Vote className="w-6 h-6" />,
    type: 'dao',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'access', description: 'Access to premium DAO features' }
  },
  {
    id: 'whale-holder',
    title: 'Whale Roach',
    description: 'Hold 1,000,000+ $BOOMROACH tokens',
    icon: <Crown className="w-6 h-6" />,
    type: 'trading',
    rarity: 'legendary',
    progress: 12483,
    maxProgress: 1000000,
    unlocked: false,
    reward: { type: 'badge', description: 'Legendary Whale badge + VIP access' }
  },
  {
    id: 'survivor',
    title: 'Survivor Roach',
    description: 'Hold through 3 major market crashes',
    icon: <Shield className="w-6 h-6" />,
    type: 'special',
    rarity: 'epic',
    progress: 1,
    maxProgress: 3,
    unlocked: false,
    reward: { type: 'tokens', amount: 10000, description: '10,000 bonus tokens' }
  }
]

// Achievement card component
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColors = {
    common: 'border-gray-500 bg-gray-500/10',
    rare: 'border-neon-blue bg-neon-blue/10',
    epic: 'border-purple-500 bg-purple-500/10',
    legendary: 'border-neon-orange bg-neon-orange/10'
  }

  const rarityGlow = {
    common: 'shadow-gray-500/20',
    rare: 'shadow-neon-blue/30',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-neon-orange/40'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}
    >
      <Card className={`glassmorphism ${rarityColors[achievement.rarity]} ${achievement.unlocked ? rarityGlow[achievement.rarity] : ''} transition-all duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
              {achievement.icon}
            </div>
            <Badge className={`${rarityColors[achievement.rarity]} capitalize`}>
              {achievement.rarity}
            </Badge>
          </div>
          <CardTitle className={`text-sm ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {achievement.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            {achievement.description}
          </p>

          {!achievement.unlocked && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{achievement.progress.toLocaleString()} / {achievement.maxProgress.toLocaleString()}</span>
              </div>
              <Progress
                value={(achievement.progress / achievement.maxProgress) * 100}
                className="h-2"
              />
            </div>
          )}

          {achievement.reward && (
            <div className="mt-3 p-2 rounded-lg bg-background/50 border border-border/50">
              <div className="text-xs font-semibold text-neon-green">Reward:</div>
              <div className="text-xs text-muted-foreground">
                {achievement.reward.description}
              </div>
            </div>
          )}

          {achievement.unlocked && achievement.unlockedAt && (
            <div className="mt-3 text-xs text-neon-green">
              ✅ Unlocked {achievement.unlockedAt.toLocaleDateString()}
            </div>
          )}
        </CardContent>

        {/* Legendary glow effect */}
        {achievement.rarity === 'legendary' && achievement.unlocked && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 165, 0, 0.3)',
                '0 0 40px rgba(255, 165, 0, 0.6)',
                '0 0 20px rgba(255, 165, 0, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </Card>
    </motion.div>
  )
}

// User level and XP system
export function UserLevelCard({
  level = 7,
  xp = 2450,
  nextLevelXp = 3000,
  userName = "Roach Survivor"
}: {
  level?: number
  xp?: number
  nextLevelXp?: number
  userName?: string
}) {
  const progressPercent = (xp / nextLevelXp) * 100

  return (
    <Card className="glassmorphism border-neon-orange/30 bg-nuclear-gradient/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-pixel text-lg text-neon-orange">{userName}</h3>
            <p className="text-sm text-muted-foreground">Nuclear Roach Level {level}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-orange">{level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Experience</span>
            <span>{xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="text-xs text-muted-foreground text-center">
            {(nextLevelXp - xp).toLocaleString()} XP to next level
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Leaderboard component
export function Leaderboard() {
  const leaderboardData = [
    { rank: 1, address: '7xK2...R9mF', tokens: '2,450,000', level: 15, badge: 'legendary' },
    { rank: 2, address: '9mR3...K7pQ', tokens: '1,890,000', level: 13, badge: 'epic' },
    { rank: 3, address: 'BxN4...L8wT', tokens: '1,234,000', level: 12, badge: 'epic' },
    { rank: 4, address: 'RoAcH...1337', tokens: '890,000', level: 10, badge: 'rare' },
    { rank: 5, address: 'N0xB...T9rA', tokens: '567,000', level: 8, badge: 'rare' }
  ]

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'legendary': return 'text-neon-orange border-neon-orange bg-neon-orange/10'
      case 'epic': return 'text-purple-400 border-purple-400 bg-purple-400/10'
      case 'rare': return 'text-neon-blue border-neon-blue bg-neon-blue/10'
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10'
    }
  }

  return (
    <Card className="glassmorphism border-nuclear-glow/30">
      <CardHeader>
        <CardTitle className="flex items-center font-pixel text-nuclear-glow">
          <Trophy className="w-5 h-5 mr-2" />
          Roach Army Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.rank <= 3 ? 'bg-neon-orange/10 border border-neon-orange/30' : 'bg-background/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  entry.rank === 1 ? 'bg-yellow-500 text-black' :
                  entry.rank === 2 ? 'bg-gray-400 text-black' :
                  entry.rank === 3 ? 'bg-orange-600 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {entry.rank}
                </div>
                <div>
                  <div className="font-mono text-sm">{entry.address}</div>
                  <div className="text-xs text-muted-foreground">Level {entry.level}</div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-semibold">{entry.tokens}</div>
                <Badge className={`text-xs ${getBadgeColor(entry.badge)}`}>
                  {entry.badge}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Achievement notification
export function AchievementNotification({
  achievement,
  show,
  onClose
}: {
  achievement: Achievement
  show: boolean
  onClose: () => void
}) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Card className="glassmorphism border-neon-orange/50 bg-nuclear-gradient/20 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-neon-orange/20 text-neon-orange">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neon-orange">Achievement Unlocked!</h4>
                  <p className="text-sm font-medium">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  {achievement.reward && (
                    <div className="mt-2 p-2 rounded bg-background/50 border border-neon-green/30">
                      <div className="text-xs text-neon-green font-semibold">
                        🎁 {achievement.reward.description}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Progress tracking component
export function ProgressTracker() {
  const progressItems = [
    { label: 'Connect Wallet', completed: true, xp: 100 },
    { label: 'Join DAO', completed: false, xp: 200 },
    { label: 'First Trade', completed: false, xp: 300 },
    { label: 'Hold 10K Tokens', completed: false, xp: 500 },
    { label: 'Become Whale', completed: false, xp: 1000 }
  ]

  const completedCount = progressItems.filter(item => item.completed).length
  const totalCount = progressItems.length

  return (
    <Card className="glassmorphism border-neon-blue/30">
      <CardHeader>
        <CardTitle className="text-sm font-pixel text-neon-blue">
          Roach Journey Progress
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {completedCount} of {totalCount} milestones completed
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {progressItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              item.completed
                ? 'bg-neon-green text-background'
                : 'border border-muted-foreground text-muted-foreground'
            }`}>
              {item.completed ? '✓' : index + 1}
            </div>
            <div className="flex-1">
              <div className={`text-sm ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.label}
              </div>
            </div>
            <div className="text-xs text-neon-green">
              +{item.xp} XP
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Main gamification dashboard
export function GamificationDashboard() {
  const [showNotification, setShowNotification] = React.useState(false)
  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null)

  const unlockedAchievements = sampleAchievements.filter(a => a.unlocked)
  const lockedAchievements = sampleAchievements.filter(a => !a.unlocked)

  return (
    <div className="space-y-6">
      {/* User Level */}
      <UserLevelCard />

      {/* Progress Tracker */}
      <ProgressTracker />

      {/* Achievements Grid */}
      <div>
        <h3 className="font-pixel text-lg text-neon-orange mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...unlockedAchievements, ...lockedAchievements].map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard />

      {/* Achievement Notification */}
      {selectedAchievement && (
        <AchievementNotification
          achievement={selectedAchievement}
          show={showNotification}
          onClose={() => {
            setShowNotification(false)
            setSelectedAchievement(null)
          }}
        />
      )}
    </div>
  )
}
