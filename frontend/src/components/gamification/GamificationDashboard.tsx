'use client'

import type React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Star,
  Zap,
  Crown,
  Target,
  Users,
  Gift,
  Flame,
  Award,
  Coins,
  Shield,
  Sparkles,
  Calendar,
  TrendingUp,
  Activity,
  Bot,
  Rocket,
  Clock,
  Heart
} from 'lucide-react'
import { useGamification } from './AchievementSystem'
import { QuestSystem } from './QuestSystem'
import { GuildSystem } from './GuildSystem'

interface GameStats {
  totalXP: number
  level: number
  nextLevelXP: number
  achievements: number
  totalAchievements: number
  questsCompleted: number
  guildRank: number
  tradingScore: number
  socialScore: number
  weeklyRank: number
  streakDays: number
}

interface RecentActivity {
  id: string
  type: 'achievement' | 'quest' | 'level' | 'trade' | 'guild'
  title: string
  description: string
  reward: string
  timestamp: Date
  icon: React.ReactNode
}

// Mock data for enhanced dashboard
const mockGameStats: GameStats = {
  totalXP: 15847,
  level: 20,
  nextLevelXP: 18000,
  achievements: 23,
  totalAchievements: 50,
  questsCompleted: 147,
  guildRank: 5,
  tradingScore: 8940,
  socialScore: 6750,
  weeklyRank: 12,
  streakDays: 7
}

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'achievement',
    title: 'Nuclear Survivor',
    description: 'Survived 3 market crashes',
    reward: '+500 XP, Diamond Badge',
    timestamp: new Date(Date.now() - 3600000),
    icon: <Shield className="w-4 h-4" />
  },
  {
    id: '2',
    type: 'quest',
    title: 'Daily Trading Master',
    description: 'Completed 5 trades today',
    reward: '+200 XP, 500 tokens',
    timestamp: new Date(Date.now() - 7200000),
    icon: <Target className="w-4 h-4" />
  },
  {
    id: '3',
    type: 'level',
    title: 'Level Up!',
    description: 'Reached level 20',
    reward: '+1000 XP, New quests unlocked',
    timestamp: new Date(Date.now() - 10800000),
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: '4',
    type: 'guild',
    title: 'Guild Quest Complete',
    description: 'Helped complete Nuclear Domination',
    reward: '+300 XP, Guild tokens',
    timestamp: new Date(Date.now() - 14400000),
    icon: <Users className="w-4 h-4" />
  }
]

export function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [gameStats] = useState<GameStats>(mockGameStats)
  const { userStats, achievements } = useGamification()

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'text-yellow-400'
      case 'quest': return 'text-neon-green'
      case 'level': return 'text-nuclear-glow'
      case 'trade': return 'text-neon-blue'
      case 'guild': return 'text-purple-400'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card className="glassmorphism border-nuclear-glow/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-nuclear-glow">
          <Trophy className="w-6 h-6" />
          <span>Roach Army Command Center</span>
          <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30">
            Level {userStats.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="quests" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Quests</span>
            </TabsTrigger>
            <TabsTrigger value="guilds" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Guild</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Achievements</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewDashboard gameStats={gameStats} userStats={userStats} />
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests">
            <QuestSystem />
          </TabsContent>

          {/* Guilds Tab */}
          <TabsContent value="guilds">
            <GuildSystem />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsPanel achievements={achievements} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Overview Dashboard Component
function OverviewDashboard({
  gameStats,
  userStats
}: {
  gameStats: GameStats
  userStats: any
}) {
  return (
    <div className="space-y-6">
      {/* Player Level and XP */}
      <Card className="glassmorphism border-nuclear-glow/30 bg-nuclear-gradient/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-nuclear-gradient flex items-center justify-center">
                <span className="text-2xl font-bold text-background">{userStats.level}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-nuclear-glow">
                  Nuclear Roach Level {userStats.level}
                </h3>
                <p className="text-muted-foreground">
                  {gameStats.totalXP.toLocaleString()} / {gameStats.nextLevelXP.toLocaleString()} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-nuclear-glow">
                {Math.round(((gameStats.totalXP / gameStats.nextLevelXP) * 100))}%
              </div>
              <div className="text-sm text-muted-foreground">To Next Level</div>
            </div>
          </div>
          <Progress
            value={(gameStats.totalXP / gameStats.nextLevelXP) * 100}
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glassmorphism border-neon-green/30 text-center">
          <CardContent className="p-4">
            <Trophy className="w-8 h-8 text-neon-green mx-auto mb-2" />
            <div className="text-xl font-bold text-neon-green">
              {gameStats.achievements}/{gameStats.totalAchievements}
            </div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-neon-blue/30 text-center">
          <CardContent className="p-4">
            <Target className="w-8 h-8 text-neon-blue mx-auto mb-2" />
            <div className="text-xl font-bold text-neon-blue">
              {gameStats.questsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Quests Done</div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-purple-400/30 text-center">
          <CardContent className="p-4">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-purple-400">
              #{gameStats.guildRank}
            </div>
            <div className="text-xs text-muted-foreground">Guild Rank</div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-neon-orange/30 text-center">
          <CardContent className="p-4">
            <Flame className="w-8 h-8 text-neon-orange mx-auto mb-2" />
            <div className="text-xl font-bold text-neon-orange">
              {gameStats.streakDays}
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glassmorphism border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-neon-blue flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trading Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Trading Score</span>
                <span className="font-bold text-neon-blue">
                  {gameStats.tradingScore.toLocaleString()}
                </span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="text-sm text-muted-foreground">
                Top 25% of traders this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-neon-green/30">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Social Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Community Points</span>
                <span className="font-bold text-neon-green">
                  {gameStats.socialScore.toLocaleString()}
                </span>
              </div>
              <Progress value={60} className="h-2" />
              <div className="text-sm text-muted-foreground">
                Active community member
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glassmorphism border-neon-orange/30">
        <CardHeader>
          <CardTitle className="text-neon-orange flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg bg-background/50"
              >
                <div className={`p-2 rounded-lg bg-background/50 ${getActivityColor(activity.type)}`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">{activity.title}</span>
                    <Badge className="text-xs">{activity.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-neon-green">
                    🎁 {activity.reward}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glassmorphism border-nuclear-glow/30">
        <CardHeader>
          <CardTitle className="text-nuclear-glow">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="bg-neon-green/20 text-neon-green hover:bg-neon-green/30 h-auto py-4 flex-col">
              <Target className="w-6 h-6 mb-2" />
              <span>Daily Quests</span>
            </Button>
            <Button className="bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 h-auto py-4 flex-col">
              <Bot className="w-6 h-6 mb-2" />
              <span>Trade Now</span>
            </Button>
            <Button className="bg-purple-400/20 text-purple-400 hover:bg-purple-400/30 h-auto py-4 flex-col">
              <Users className="w-6 h-6 mb-2" />
              <span>Guild Hall</span>
            </Button>
            <Button className="bg-neon-orange/20 text-neon-orange hover:bg-neon-orange/30 h-auto py-4 flex-col">
              <Gift className="w-6 h-6 mb-2" />
              <span>Claim Rewards</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Achievements Panel Component
function AchievementsPanel({ achievements }: { achievements: any[] }) {
  const categories = ['all', 'trading', 'social', 'special', 'rare']
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.type === selectedCategory)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const progressCount = achievements.filter(a => !a.unlocked && a.progress > 0).length

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glassmorphism border-neon-green/30 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-neon-green">{unlockedCount}</div>
            <div className="text-xs text-muted-foreground">Unlocked</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-neon-orange/30 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-neon-orange">{progressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-muted/30 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {achievements.length - unlockedCount}
            </div>
            <div className="text-xs text-muted-foreground">Locked</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg ${
              achievement.unlocked
                ? 'glassmorphism border-neon-green/30'
                : 'bg-background/30 border border-muted/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {achievement.description}
                </p>
                {!achievement.unlocked && achievement.maxProgress > 1 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      className="h-1"
                    />
                  </div>
                )}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-neon-green mt-2">
                    ✅ Unlocked {formatTimeAgo(achievement.unlockedAt)}
                  </div>
                )}
              </div>
              <Badge className={`text-xs ${
                achievement.rarity === 'legendary' ? 'bg-purple-400/20 text-purple-400 border-purple-400/30' :
                achievement.rarity === 'epic' ? 'bg-neon-orange/20 text-neon-orange border-neon-orange/30' :
                achievement.rarity === 'rare' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' :
                'bg-neon-green/20 text-neon-green border-neon-green/30'
              }`}>
                {achievement.rarity}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
